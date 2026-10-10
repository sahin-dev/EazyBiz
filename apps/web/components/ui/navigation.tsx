import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type NavigationItem = { label: string; href: string; icon: LucideIcon; badge?: string };

export function NavigationList({ label, items, pathname, onNavigate }: { label: string; items: NavigationItem[]; pathname: string; onNavigate?: () => void }) {
  return <nav className="ds-nav" aria-label={label}>{items.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className="ds-nav-link" aria-current={active ? "page" : undefined} onClick={onNavigate}><Icon size={18} aria-hidden="true" /><span>{item.label}</span>{item.badge ? <small>{item.badge}</small> : null}</Link>; })}</nav>;
}

export function SidebarFrame({ title, header, footer, children }: { title: string; header: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return <aside className="ds-sidebar" aria-label={title}><div className="ds-sidebar-header">{header}</div><div className="ds-sidebar-body">{children}</div>{footer ? <div className="ds-sidebar-footer">{footer}</div> : null}</aside>;
}
