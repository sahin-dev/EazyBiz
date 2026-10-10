"use client";

import { AlertCircle, CheckCircle2, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type FeedbackTone = "success" | "warning" | "danger" | "info";

export function Alert({ title, children, tone = "info" }: { title: string; children?: ReactNode; tone?: FeedbackTone }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "warning" ? TriangleAlert : tone === "danger" ? AlertCircle : Info;
  return <div className={`ds-alert ${tone}`} role={tone === "danger" ? "alert" : "status"}><Icon size={18} aria-hidden="true" /><div><strong>{title}</strong>{children ? <div>{children}</div> : null}</div></div>;
}

type ToastMessage = { id: number; title: string; message?: string; tone: FeedbackTone };
type ToastApi = { notify: (toast: Omit<ToastMessage, "id">) => void };
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { ...toast, id }].slice(-4));
    timers.current.set(id, setTimeout(() => dismiss(id), toast.tone === "danger" ? 8000 : 5000));
  }, [dismiss]);

  useEffect(() => () => { for (const timer of timers.current.values()) clearTimeout(timer); }, []);

  return <ToastContext.Provider value={{ notify }}>{children}<div className="ds-toast-stack" aria-live="polite" aria-relevant="additions">{toasts.map((toast) => <div key={toast.id} className={`ds-toast ${toast.tone}`} role={toast.tone === "danger" ? "alert" : "status"}><div><strong>{toast.title}</strong>{toast.message ? <p>{toast.message}</p> : null}</div><button type="button" className="ds-icon-button compact" aria-label={`Dismiss ${toast.title}`} title="Dismiss notification" onClick={() => dismiss(toast.id)}><X size={16} /></button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export function Skeleton({ width = "100%", height = 14 }: { width?: string | number; height?: string | number }) {
  return <span className="ds-skeleton" aria-hidden="true" style={{ width, height }} />;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="ds-state" role="status" aria-label={label}><LoaderCircle size={20} className="spin" aria-hidden="true" /><span>{label}</span><Skeleton width="min(100%, 360px)" /><Skeleton width="min(80%, 290px)" /></div>;
}

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return <div className="ds-state" role="alert"><AlertCircle size={23} aria-hidden="true" /><h2>{title}</h2><p>{message}</p>{onRetry ? <button type="button" className="button secondary" onClick={onRetry}>Try again</button> : null}</div>;
}

export function ChartFrame({ title, description, legend, children }: { title: string; description: string; legend?: Array<{ label: string; color: string }>; children: ReactNode }) {
  return <figure className="ds-chart" role="group" aria-label={title}><figcaption><strong>{title}</strong><p className="ds-muted">{description}</p></figcaption>{children}{legend?.length ? <div className="ds-chart-legend" aria-label="Chart legend">{legend.map((item) => <span key={item.label}><i aria-hidden="true" style={{ "--legend-color": item.color } as CSSProperties} />{item.label}</span>)}</div> : null}</figure>;
}
