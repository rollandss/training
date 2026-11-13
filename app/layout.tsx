import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { ParticlesBackgroundLazy } from "@/components/particles-background-lazy";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getMetadataBase, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_TITLE } from "@/lib/site";

import "./globals.css";

// Self-hosted Geist (includes Cyrillic). The Google variant was loaded with latin subsets only,
// so all Ukrainian text silently fell back to the system font.
export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="relative flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ParticlesBackgroundLazy />
          <div className="relative z-[2] flex min-h-full flex-1 flex-col">{children}</div>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
