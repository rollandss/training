import "server-only";

import { AwsClient } from "aws4fetch";

/** Private Cloudflare R2 bucket accessed through its S3 API with presigned URLs. */
function env() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function r2Configured() {
  return env() !== null;
}

let cached: { client: AwsClient; base: string } | null = null;

function client() {
  if (cached) return cached;
  const e = env();
  if (!e) throw new Error("R2 is not configured");
  cached = {
    client: new AwsClient({ accessKeyId: e.accessKeyId, secretAccessKey: e.secretAccessKey, service: "s3", region: "auto" }),
    base: `https://${e.accountId}.r2.cloudflarestorage.com/${e.bucket}`,
  };
  return cached;
}

function objectUrl(key: string) {
  const { base } = client();
  return `${base}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function presign(key: string, method: "GET" | "PUT", expiresSeconds: number, headers?: Record<string, string>) {
  const url = new URL(objectUrl(key));
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds));
  const signed = await client().client.sign(new Request(url, { method, headers }), { aws: { signQuery: true } });
  return signed.url;
}

/** URL the browser PUTs the file to. The Content-Type header must match exactly. */
export function presignUpload(key: string, contentType: string, expiresSeconds = 600) {
  return presign(key, "PUT", expiresSeconds, { "content-type": contentType });
}

export function presignDownload(key: string, expiresSeconds = 3600) {
  return presign(key, "GET", expiresSeconds);
}

/** Size in bytes, or null if the object does not exist. */
export async function headObject(key: string) {
  const res = await client().client.fetch(objectUrl(key), { method: "HEAD" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 HEAD failed: ${res.status}`);
  return { bytes: Number(res.headers.get("content-length") ?? 0), contentType: res.headers.get("content-type") ?? "" };
}

export async function deleteObject(key: string) {
  const res = await client().client.fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`R2 DELETE failed: ${res.status}`);
}

/** Best effort: used when removing a user. Never throws. */
export async function deleteObjects(keys: string[]) {
  if (!r2Configured()) return;
  await Promise.allSettled(keys.map((k) => deleteObject(k)));
}
