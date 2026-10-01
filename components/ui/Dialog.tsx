"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "./icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function Dialog({ open, onClose, title, description, children, actions, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Chrome can close a modal natively without a cancelable `cancel` event; keep state in sync.
        if (open) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-32px)] max-w-md rounded-dialog border-2 border-ink bg-card p-6 text-ink shadow-hard open:animate-pop-in",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-xl">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-ink/10"
        >
          <CloseIcon size={20} />
        </button>
      </div>
      {description && (
        <div id={descriptionId} className="mt-2 text-soft">
          {description}
        </div>
      )}
      {children && <div className="mt-4">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div>}
    </dialog>
  );
}
