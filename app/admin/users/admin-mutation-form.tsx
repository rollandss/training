"use client";

import * as React from "react";
import { toast } from "sonner";

import { type AdminMutationResult } from "./actions";

type Props = {
  action: (formData: FormData) => Promise<AdminMutationResult>;
  successMessage: string;
  className?: string;
  children: React.ReactNode;
};

export function AdminMutationForm({ action, successMessage, className, children }: Props) {
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <form
      className={className}
      onSubmit={async (event) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
          const result = await action(new FormData(event.currentTarget));
          if (result.ok) {
            toast.success(successMessage);
            return;
          }
          toast.error(result.error);
        } catch {
          toast.error("Не вдалося зберегти зміни");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <fieldset disabled={submitting} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
