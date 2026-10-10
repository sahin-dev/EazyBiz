"use client";

import { LoaderCircle, X } from "lucide-react";
import { useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { useDialogFocus } from "./use-dialog-focus";

export function Button({ variant = "primary", loading = false, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" | "danger"; loading?: boolean }) {
  return <button {...props} disabled={loading || props.disabled} aria-busy={loading || undefined} className={`button ${variant} ${props.className ?? ""}`}>{loading ? <LoaderCircle size={16} className="spin" aria-hidden="true" /> : null}{children}</button>;
}

export function Input({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [props["aria-describedby"], hint && helpId, error && errorId].filter(Boolean).join(" ") || undefined;
  return <label className="form-field" htmlFor={id}><span>{label}</span><input {...props} id={id} aria-invalid={Boolean(error) || props["aria-invalid"] || undefined} aria-describedby={describedBy} />{hint ? <small id={helpId}>{hint}</small> : null}{error ? <small id={errorId} className="field-error">{error}</small> : null}</label>;
}

export function Select({ label, hint, error, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; error?: string; children: ReactNode }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const describedBy = [props["aria-describedby"], hint && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <label className="form-field" htmlFor={id}><span>{label}</span><select {...props} id={id} aria-invalid={Boolean(error) || props["aria-invalid"] || undefined} aria-describedby={describedBy}>{children}</select>{hint ? <small id={`${id}-help`}>{hint}</small> : null}{error ? <small id={`${id}-error`} className="field-error">{error}</small> : null}</label>;
}

export function Drawer({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  useDialogFocus(ref, onClose);
  return <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside ref={ref} tabIndex={-1} className="drawer" role="dialog" aria-modal="true" aria-labelledby={id}><header className="drawer-header"><h2 id={id}>{title}</h2><button type="button" className="icon-button" title="Close" aria-label="Close" onClick={onClose}><X size={19} /></button></header><div className="drawer-content">{children}</div>{footer ? <footer className="drawer-footer">{footer}</footer> : null}</aside></div>;
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "danger" | "neutral" }) {
  return <span className={`status-badge ${tone}`}><i aria-hidden="true" />{label}</span>;
}

export function EmptyState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return <div className="empty-state"><span aria-hidden="true">{icon}</span><strong>{title}</strong><span>{detail}</span>{action}</div>;
}

export function Notice({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return <div className={`notice ${tone}`} role={tone === "error" ? "alert" : "status"}>{message}</div>;
}
