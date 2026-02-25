"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { Button } from "./ui/Button";

type ToastVariant = "default" | "success" | "error";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastApi {
  show: (t: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const iconBase = "h-5 w-5";
  if (variant === "success") {
    return <CheckCircle2 className={`${iconBase} text-primary`} />;
  }
  if (variant === "error") {
    return <AlertCircle className={`${iconBase} text-destructive`} />;
  }
  return <Info className={`${iconBase} text-muted-foreground`} />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, ...t }]);
      timers.current[id] = window.setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  const api: ToastApi = useMemo(
    () => ({
      show,
      success: (title, description) => show({ title, description, variant: "success" }),
      error: (title, description) => show({ title, description, variant: "error" }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-toast-in rounded-2xl border border-border bg-card/80 shadow-medium backdrop-blur-sm"
          >
            <div className="flex items-start gap-4 p-4">
              <div className="mt-1 flex-shrink-0">
                <ToastIcon variant={t.variant} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(t.id)}
                className="-my-1 -mr-1 h-8 w-8"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(calc(100% + 1rem)); }
          to { transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
