"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import { Toast, ToastProviderPrimitive, ToastViewport } from "@/components/ui/Toast";

// design.md §6 Toast: at most 3 visible, success dismisses after 4 s, an error stays until dismissed.
export const MAX_TOASTS = 3;
export const SUCCESS_TOAST_MS = 4000;

export type ToastInput = { tone: "success" | "error"; title: string; description?: string };
type ToastEntry = ToastInput & { id: number };

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

/** Mounted once in the console layout. Everything inside can call `useToast()`. */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const show = useCallback((toast: ToastInput) => {
    nextId.current += 1;
    const entry = { ...toast, id: nextId.current };
    // The oldest toast makes room for the newest.
    setToasts((current) => [...current, entry].slice(-MAX_TOASTS));
  }, []);

  const dismiss = (id: number) => setToasts((current) => current.filter((toast) => toast.id !== id));

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext value={value}>
      <ToastProviderPrimitive label="Notifications" swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            tone={toast.tone}
            title={toast.title}
            description={toast.description}
            duration={toast.tone === "error" ? Infinity : SUCCESS_TOAST_MS}
            onOpenChange={(open) => !open && dismiss(toast.id)}
          />
        ))}
        <ToastViewport />
      </ToastProviderPrimitive>
    </ToastContext>
  );
};

export const useToast = () => {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside the console layout's ToastProvider");
  return show;
};
