"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertIcon, CheckIcon, CloseIcon } from "./icons";

export type ToastVariant = "success" | "error";

type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = { toast: (message: string, variant?: ToastVariant) => void };

export const TOAST_DURATION_MS = 4000;

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    setToasts((current) => [...current, { id: Date.now() + Math.random(), message, variant }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-3 px-4 lg:inset-x-auto lg:right-8 lg:bottom-8 lg:items-end lg:px-0"
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const isError = item.variant === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm animate-pop-in items-center gap-3 rounded-card border-2 border-ink px-4 py-3 font-medium shadow-hard",
        isError ? "bg-danger text-white" : "bg-mint text-on-accent",
      )}
    >
      {isError ? <AlertIcon size={20} /> : <CheckIcon size={20} />}
      <p className="flex-1">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-black/10"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
