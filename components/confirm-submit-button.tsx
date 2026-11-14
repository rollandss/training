"use client";

import { SubmitButton } from "@/components/submit-button";

/** Submit button that asks for confirmation first. Use for irreversible actions. */
export function ConfirmSubmitButton({
  confirmText,
  onClick,
  ...props
}: React.ComponentProps<typeof SubmitButton> & { confirmText: string }) {
  return (
    <SubmitButton
      {...props}
      onClick={(event) => {
        if (!window.confirm(confirmText)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
