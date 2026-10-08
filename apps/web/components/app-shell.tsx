"use client";

import { Activity, Boxes, ChefHat, ChevronLeft, CircleHelp, ClipboardList, CreditCard, FileClock, LayoutDashboard, LogOut, Menu, Package, PanelTop, Search, ShoppingCart, Store, Table2, Truck, Users, UsersRound, X, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { moduleCatalog, type ModuleId } from "@businessos/domain";
import type { SessionData } from "@/lib/types";

type NavItem = { label: string; href: string; icon: LucideIcon; module?: ModuleId; roles?: string[]; keywords?: string[] };
type RuntimeNavItem = NavItem & { group: string; locked: boolean };

const navigation: Array<{ title: string; items: NavItem[] }> = [
  { title: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, keywords: ["home", "overview"] }] },
  { title: "Sales", items: [{ label: "Point of sale", href: "/pos", icon: ShoppingCart, module: "pos", keywords: ["checkout", "billing", "receipt"] }, { label: "Orders", href: "/orders", icon: ClipboardList, module: "pos", keywords: ["sales history"] }] },
  { title: "Catalog", items: [{ label: "Products", href: "/products", icon: Package, module: "inventory", keywords: ["sku", "barcode"] }] },
  { title: "Inventory", items: [{ label: "Stock", href: "/inventory", icon: Boxes, module: "inventory", keywords: ["movement", "adjustment"] }, { label: "Suppliers", href: "/suppliers", icon: Truck, module: "suppliers", keywords: ["purchase", "vendor"] }] },
  { title: "People", items: [{ label: "Customers", href: "/customers", icon: UsersRound, module: "customers", keywords: ["crm", "loyalty"] }, { label: "Staff", href: "/staff", icon: Users, module: "staff", roles: ["owner", "admin", "manager"], keywords: ["employees", "payroll"] }] },
  { title: "Restaurant", items: [{ label: "Kitchen", href: "/kitchen", icon: ChefHat, module: "restaurantKitchen", keywords: ["kds", "kot"] }, { label: "Tables", href: "/tables", icon: Table2, module: "restaurantTables", keywords: ["floor", "dine in"] }] },
  { title: "Growth", items: [{ label: "Storefront", href: "/storefront", icon: Store, module: "storefront", keywords: ["website", "builder"] }, { label: "Reports", href: "/reports", icon: Activity, module: "reports", keywords: ["analytics", "export"] }, { label: "Subscription", href: "/subscription", icon: CreditCard, roles: ["owner", "admin"], keywords: ["billing", "modules", "marketplace"] }] },
  { title: "Admin", items: [{ label: "Users & access", href: "/users", icon: Users, roles: ["owner", "admin"], keywords: ["accounts", "roles", "permissions", "invitations"] }, { label: "Audit log", href: "/audit", icon: FileClock, roles: ["owner", "admin"], keywords: ["activity", "events", "security"] }] },
];

export function AppShell({ session, branchId, children }: { session: SessionData; branchId?: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(branchId ?? "all");
  const router = useRouter();
  const pathname = usePathname();
  const tenant = session.tenant;
  const isPlatformAdmin = session.user.role === "platformAdmin";
  const groups = useMemo(
    () => isPlatformAdmin ? [{ title: "Platform", items: [{ label: "Platform admin", href: "/platform-admin", icon: PanelTop, keywords: ["tenants", "billing", "modules"] }] }] : navigation,
    [isPlatformAdmin],
  );
  const moduleMap = new Map(moduleCatalog.map((item) => [item.id, item]));

  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => !item.roles || item.roles.includes(session.user.role))
      .map((item) => ({ ...item, group: group.title, locked: Boolean(item.module && !tenant?.enabledModules.includes(item.module)) })),
  })).filter((group) => group.items.length), [groups, session.user.role, tenant?.enabledModules]);

  const commands = useMemo<RuntimeNavItem[]>(() => visibleGroups.flatMap((group) => group.items), [visibleGroups]);
  const filteredCommands = commands.filter((item) => {
    const term = commandQuery.trim().toLowerCase();
    return !term || `${item.label} ${item.group} ${item.keywords?.join(" ") ?? ""}`.toLowerCase().includes(term);
  }).slice(0, 8);
  const activeBranch = tenant?.branches.find((branch) => branch.id === selectedBranchId);
  const workspaceStatus = [
    tenant ? `${tenant.name} is on the ${tenant.plan} plan.` : "Platform administration mode is active.",
    tenant?.subscription ? `Subscription ${tenant.subscription.status}; next period ends ${new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" }).format(new Date(tenant.subscription.currentPeriodEnd))}.` : "Subscription review is required.",
    tenant?.storefrontStatus === "published" ? "Storefront is published and synced with POS inventory." : "Storefront is still in draft mode.",
  ];

  useEffect(() => {
    setSelectedBranchId(branchId ?? "all");
  }, [branchId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  async function chooseBranch(nextBranchId: string) {
    setSelectedBranchId(nextBranchId);
    const response = await fetch("/api/workspace/branch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branchId: nextBranchId }) });
    if (!response.ok) { setSelectedBranchId(branchId ?? "all"); return; }
    router.refresh();
  }

  function goTo(item: RuntimeNavItem) {
    setCommandOpen(false);
    setCommandQuery("");
    router.push(item.locked ? "/subscription" : item.href);
  }

  return (
    <div className={`app-frame ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen ? <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Link href={isPlatformAdmin ? "/platform-admin" : "/dashboard"} className="sidebar-brand" onClick={() => setMobileOpen(false)}>
            <span className="sidebar-logo"><Store size={20} strokeWidth={2.4} /></span>
            <span><strong>BusinessOS</strong><small>WORKSPACE</small></span>
          </Link>
          <button className="collapse-toggle icon-button" title={collapsed ? "Expand navigation" : "Collapse navigation"} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)}><ChevronLeft size={17} /></button>
          <button className="mobile-close icon-button" title="Close navigation" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <div className="tenant-switcher">
          <span className="tenant-avatar">{tenant?.name.charAt(0) ?? "P"}</span>
          <span><strong>{tenant?.name ?? "Platform administration"}</strong><small>{tenant?.businessType ?? "SaaS control"} {tenant?.plan ? `/ ${tenant.plan}` : ""}</small></span>
        </div>
        <nav className="sidebar-navigation" aria-label="Primary navigation">
          {visibleGroups.map((group) => <div className="nav-group" key={group.title}>
            <span className="nav-group-label">{group.title}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const moduleName = item.module ? moduleMap.get(item.module)?.name : null;
              return <Link key={`${group.title}-${item.label}`} href={item.locked ? "/subscription" : item.href} title={item.locked && moduleName ? `${moduleName} is not active` : item.label} className={`nav-link ${active ? "active" : ""} ${item.locked ? "locked" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.locked ? <small>Upgrade</small> : null}</Link>;
            })}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <a className="nav-link" href="mailto:support@businessos.bd"><CircleHelp size={18} /><span>Help & support</span></a>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <div className="header-left"><button className="header-menu icon-button" title="Open navigation" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><span className="header-location">Workspace <span>/</span> <strong>{pathname.split("/")[1]?.replaceAll("-", " ") || "Dashboard"}</strong></span></div>
          <button className="global-search" type="button" onClick={() => setCommandOpen(true)}><Search size={16} /><span>Search pages and tools</span><kbd>Ctrl K</kbd></button>
          <div className="header-right">
            {tenant ? <label className="branch-switcher"><span className="online-dot" /><select value={selectedBranchId} disabled={Boolean(session.user.branchId)} onChange={(event) => void chooseBranch(event.target.value)} aria-label="Select operational branch"><option value="all">All branches</option>{tenant.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label> : null}
            <button className="notification-button icon-button" title="Workspace status" aria-label="Workspace status" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><Activity size={18} /></button>
            <div className="user-summary"><span className="user-avatar">{session.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><strong>{session.user.name}</strong><small>{session.user.role}</small></span></div>
            <button className="icon-button signout" title="Sign out" aria-label="Sign out" onClick={logout}><LogOut size={18} /></button>
          </div>
          {notificationsOpen ? <div className="notification-panel"><div className="notification-panel-head"><strong>Workspace status</strong><button type="button" className="icon-button compact" aria-label="Close status" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{workspaceStatus.map((item, index) => <div className="notification-item" key={item}><span className={index === 2 && tenant?.storefrontStatus !== "published" ? "alert" : ""}><Activity size={14} /></span><p>{item}</p></div>)}</div> : null}
        </header>
        <main className="app-content">{children}</main>
      </div>
      {commandOpen ? <div className="command-backdrop" role="presentation" onMouseDown={() => setCommandOpen(false)}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(event) => event.stopPropagation()}><label className="command-input"><Search size={18} /><input autoFocus value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search pages and tools" /></label><div className="command-list">{filteredCommands.map((item) => { const Icon = item.icon; return <button type="button" key={`${item.group}-${item.label}`} onClick={() => goTo(item)}><Icon size={17} /><span><strong>{item.label}</strong><small>{item.locked ? "Explore module activation" : item.group}</small></span>{item.locked ? <em>Upgrade</em> : null}</button>; })}{!filteredCommands.length ? <div className="command-empty"><Zap size={22} /><strong>No page found</strong><span>Try a different page or tool name.</span></div> : null}</div><footer className="command-footer"><span>{activeBranch?.name ?? "All branches"}</span><span>Esc to close</span></footer></section></div> : null}
    </div>
  );
}
