"use client";

import { ChevronDown, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cloneElement, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { useDialogFocus } from "./use-dialog-focus";

export function Modal({ title, children, footer, onClose }: { title: string; children: ReactNode; footer?: ReactNode; onClose: () => void }) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  useDialogFocus(ref, onClose);
  return <div className="ds-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} tabIndex={-1} className="ds-dialog" role="dialog" aria-modal="true" aria-labelledby={id}><header className="ds-dialog-header"><h2 id={id}>{title}</h2><button type="button" className="ds-icon-button compact" title="Close" aria-label="Close" onClick={onClose}><X size={17} /></button></header><div className="ds-dialog-content">{children}</div>{footer ? <footer className="ds-dialog-footer">{footer}</footer> : null}</section></div>;
}

export function DropdownMenu({ label, items, disabled }: { label: string; items: Array<{ id: string; label: string; onSelect: () => void; disabled?: boolean }>; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    buttons.current.find((button) => button && !button.disabled)?.focus();
    function onPointer(event: PointerEvent) { if (!root.current?.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function move(current: number, direction: number) {
    for (let offset = 1; offset <= items.length; offset++) {
      const index = (current + direction * offset + items.length * offset) % items.length;
      if (!items[index].disabled) { buttons.current[index]?.focus(); return; }
    }
  }

  return <div className="ds-menu-wrap" ref={root}><button ref={trigger} type="button" className="button secondary" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} disabled={disabled} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}>{label}<ChevronDown size={15} aria-hidden="true" /></button>{open ? <div className="ds-menu" id={id} role="menu" aria-label={label} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); } }} >{items.map((item, index) => <button key={item.id} ref={(node) => { buttons.current[index] = node; }} type="button" role="menuitem" tabIndex={index === 0 ? 0 : -1} disabled={item.disabled} onKeyDown={(event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); move(index, event.key === "ArrowDown" ? 1 : -1); } }} onClick={() => { setOpen(false); item.onSelect(); trigger.current?.focus(); }}>{item.label}</button>)}</div> : null}</div>;
}

export function Tooltip({ text, children }: { text: string; children: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>> }) {
  const id = useId();
  const describedBy = [children.props["aria-describedby"], id].filter(Boolean).join(" ");
  return <span className="ds-tooltip-wrap">{cloneElement(children, { "aria-describedby": describedBy })}<span id={id} className="ds-tooltip" role="tooltip">{text}</span></span>;
}

export type CommandItem = { id: string; label: string; group: string; keywords?: string[]; icon: LucideIcon; badge?: string; description?: string };

export function CommandPalette({ items, onSelect, onClose, footer }: { items: CommandItem[]; onSelect: (id: string) => void; onClose: () => void; footer?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const optionBaseId = useId();
  useDialogFocus(ref, onClose);
  const matches = items.filter((item) => `${item.label} ${item.group} ${item.keywords?.join(" ") ?? ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 8);

  function choose(index: number) { const item = matches[index]; if (item) onSelect(item.id); }

  return <div className="command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section ref={ref} tabIndex={-1} className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette"><label className="command-input"><Search size={18} aria-hidden="true" /><input autoFocus value={query} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${optionBaseId}-list`} aria-activedescendant={matches[activeIndex] ? `${optionBaseId}-option-${activeIndex}` : undefined} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, Math.max(0, matches.length - 1))); } else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); } else if (event.key === "Enter") { event.preventDefault(); choose(activeIndex); } }} placeholder="Search pages and tools" aria-label="Search pages and tools" /></label><div id={`${optionBaseId}-list`} className="command-list" role="listbox" aria-label="Matching pages and tools">{matches.map((item, index) => { const Icon = item.icon; return <button type="button" role="option" aria-selected={index === activeIndex} id={`${optionBaseId}-option-${index}`} key={item.id} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)}><Icon size={17} aria-hidden="true" /><span><strong>{item.label}</strong><small>{item.description ?? item.group}</small></span>{item.badge ? <em>{item.badge}</em> : null}</button>; })}{!matches.length ? <div className="command-empty" role="status"><strong>No page found</strong><span>Try another name.</span></div> : null}</div>{footer ? <footer className="command-footer">{footer}</footer> : null}</section></div>;
}
