"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button type="button" {...props} aria-label={label} title={props.title ?? label} className={`ds-icon-button ${className}`}>{children}</button>;
}

export function Textarea({ label, hint, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const describedBy = [props["aria-describedby"], hint && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <label className="form-field" htmlFor={id}><span>{label}</span><textarea {...props} id={id} aria-invalid={Boolean(error) || props["aria-invalid"] || undefined} aria-describedby={describedBy} />{hint ? <small id={`${id}-help`}>{hint}</small> : null}{error ? <small id={`${id}-error`} className="field-error">{error}</small> : null}</label>;
}

export function Checkbox({ label, description, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; description?: string }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return <label className="ds-check" htmlFor={id}><input {...props} id={id} type="checkbox" /><span>{label}{description ? <small className="ds-muted"> {description}</small> : null}</span></label>;
}

export function Switch({ label, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  return <label className="ds-switch" htmlFor={id}><input {...props} id={id} type="checkbox" role="switch" /><span className="ds-switch-track" aria-hidden="true" /><span>{label}</span></label>;
}

export type Choice = { value: string; label: string; disabled?: boolean };

export function SegmentedControl({ label, choices, value, onChange }: { label: string; choices: Choice[]; value: string; onChange: (value: string) => void }) {
  return <div className="ds-segmented" role="group" aria-label={label}>{choices.map((choice) => <button type="button" key={choice.value} disabled={choice.disabled} aria-pressed={value === choice.value} onClick={() => onChange(choice.value)}>{choice.label}</button>)}</div>;
}

export function Tabs({ label, tabs, selectedId, onChange }: { label: string; tabs: Array<{ id: string; label: string; content: ReactNode; disabled?: boolean }>; selectedId: string; onChange: (id: string) => void }) {
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = tabs.find((tab) => tab.id === selectedId && !tab.disabled) ?? tabs.find((tab) => !tab.disabled);

  function move(current: number, direction: number) {
    for (let offset = 1; offset <= tabs.length; offset++) {
      const next = (current + direction * offset + tabs.length * offset) % tabs.length;
      if (!tabs[next].disabled) { onChange(tabs[next].id); tabRefs.current[next]?.focus(); return; }
    }
  }

  return <div><div className="ds-tabs" role="tablist" aria-label={label}>{tabs.map((tab, index) => <button key={tab.id} ref={(node) => { tabRefs.current[index] = node; }} type="button" role="tab" id={`${baseId}-tab-${index}`} aria-controls={`${baseId}-panel-${index}`} aria-selected={active?.id === tab.id} tabIndex={active?.id === tab.id ? 0 : -1} disabled={tab.disabled} onClick={() => onChange(tab.id)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); move(index, 1); } else if (event.key === "ArrowLeft") { event.preventDefault(); move(index, -1); } }}>{tab.label}</button>)}</div>{tabs.map((tab, index) => <div key={tab.id} role="tabpanel" id={`${baseId}-panel-${index}`} aria-labelledby={`${baseId}-tab-${index}`} hidden={active?.id !== tab.id} tabIndex={active?.id === tab.id ? 0 : -1}>{active?.id === tab.id ? tab.content : null}</div>)}</div>;
}

export function Pagination({ page, pageCount, onPageChange, label = "Results" }: { page: number; pageCount: number; onPageChange: (page: number) => void; label?: string }) {
  const safeCount = Math.max(1, pageCount);
  const safePage = Math.min(Math.max(page, 1), safeCount);
  return <nav className="ds-pagination" aria-label={`${label} pages`}><span aria-live="polite">Page {safePage} of {safeCount}</span><div className="ds-pagination-actions"><button type="button" aria-label="Previous page" title="Previous page" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Next page" title="Next page" disabled={safePage >= safeCount} onClick={() => onPageChange(safePage + 1)}><ChevronRight size={17} /></button></div></nav>;
}
