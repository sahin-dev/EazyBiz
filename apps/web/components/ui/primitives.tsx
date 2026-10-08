"use client";

import { X } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Button({ variant = "primary", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "quiet" }) {
  return <button {...props} className={`button ${variant} ${props.className ?? ""}`}>{children}</button>;
}

export function Input({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="form-field"><span>{label}</span><input {...props} />{hint ? <small>{hint}</small> : null}</label>;
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="form-field"><span>{label}</span><select {...props}>{children}</select></label>;
}

export function Drawer({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  return <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}><aside className="drawer" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}><header className="drawer-header"><h2>{title}</h2><button type="button" className="icon-button" title="Close" aria-label="Close" onClick={onClose}><X size={19} /></button></header><div className="drawer-content">{children}</div>{footer ? <footer className="drawer-footer">{footer}</footer> : null}</aside></div>;
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "danger" | "neutral" }) {
  return <span className={`status-badge ${tone}`}><i />{label}</span>;
}

export function EmptyState({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="empty-state">{icon}<strong>{title}</strong><span>{detail}</span></div>;
}

export function Notice({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return <div className={`notice ${tone}`} role={tone === "error" ? "alert" : "status"}>{message}</div>;
}
