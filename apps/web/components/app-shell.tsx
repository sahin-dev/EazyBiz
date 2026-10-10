"use client";

import { Activity, Boxes, Building2, ChefHat, ChevronLeft, CircleHelp, ClipboardList, CreditCard, FileClock, LayoutDashboard, LogOut, Menu, Package, PanelTop, Search, ShoppingCart, Store, Table2, Truck, UserRound, Users, UsersRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { businessTypeConfigs, hasPermission, moduleCatalog, type NavigationItemDefinition, type RoleId } from "@businessos/domain";
import type { SessionData } from "@/lib/types";
import { workspaceHome } from "@/lib/workspace-home";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandPalette } from "@/components/ui/overlays";
import { moduleIsEnabled } from "@/components/ui/feature-gate";

type RuntimeNavItem = NavigationItemDefinition & { locked: boolean; iconComponent: LucideIcon };

const iconMap: Record<string, LucideIcon> = {
  activity: Activity,
  boxes: Boxes,
  chefHat: ChefHat,
  clipboardList: ClipboardList,
  creditCard: CreditCard,
  fileClock: FileClock,
  layoutDashboard: LayoutDashboard,
  package: Package,
  shoppingCart: ShoppingCart,
  store: Store,
  table2: Table2,
  truck: Truck,
  users: Users,
  usersRound: UsersRound,
};

const platformNavigation: Array<{ title: string; items: RuntimeNavItem[] }> = [
  { title: "Platform", items: [{ id: "platform-admin", group: "Admin", label: "Platform admin", href: "/platform-admin", icon: "panelTop", iconComponent: PanelTop, keywords: ["tenants", "billing", "modules"], locked: false }] },
];

function groupNavigation(items: readonly NavigationItemDefinition[]): Array<{ title: string; items: NavigationItemDefinition[] }> {
  const groups = new Map<string, NavigationItemDefinition[]>();
  for (const item of items) groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
  return [...groups.entries()].map(([title, groupItems]) => ({ title, items: groupItems }));
}

export function AppShell({ session, branchId, children }: { session: SessionData; branchId?: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(branchId ?? "all");
  const [signoutError, setSignoutError] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const tenant = session.tenant;
  const tenantBusinessType = tenant?.businessType;
  const isPlatformAdmin = session.user.role === "platformAdmin";
  const groups = useMemo(() => {
    if (isPlatformAdmin) return platformNavigation;
    if (!tenantBusinessType) return [];
    return groupNavigation(businessTypeConfigs[tenantBusinessType].defaultNavigation);
  }, [isPlatformAdmin, tenantBusinessType]);
  const moduleMap = new Map(moduleCatalog.map((item) => [item.id, item]));

  const visibleGroups = useMemo(() => groups.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => (!item.roles || item.roles.includes(session.user.role as RoleId)) && (!item.permission || hasPermission(session.user.role, item.permission)))
      .filter((item) => !item.moduleId || (tenant ? moduleIsEnabled(tenant, item.moduleId) : false))
      .map((item) => ({ ...item, locked: false, iconComponent: iconMap[item.icon] ?? Package })),
  })).filter((group) => group.items.length), [groups, session.user.role, tenant]);

  const commands = useMemo<RuntimeNavItem[]>(() => visibleGroups.flatMap((group) => group.items), [visibleGroups]);
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
    setSignoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Unable to sign out. Try again.");
      router.replace("/login");
      router.refresh();
    } catch (cause) { setSignoutError(cause instanceof Error ? cause.message : "Unable to sign out."); }
  }

  async function chooseBranch(nextBranchId: string) {
    setSelectedBranchId(nextBranchId);
    const response = await fetch("/api/workspace/branch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branchId: nextBranchId }) });
    if (!response.ok) { setSelectedBranchId(branchId ?? "all"); return; }
    router.refresh();
  }

  function goTo(item: RuntimeNavItem) {
    setCommandOpen(false);
    router.push(item.locked ? "/subscription" : item.href);
  }

  return (
    <div className={`app-frame ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen ? <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /> : null}
      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-top">
          <Link href={workspaceHome(session.user.role, tenant?.enabledModules ?? [])} className="sidebar-brand" onClick={() => setMobileOpen(false)}>
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
              const Icon = item.iconComponent;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const moduleName = item.moduleId ? moduleMap.get(item.moduleId)?.name : null;
              return <Link key={`${group.title}-${item.label}`} href={item.locked ? "/subscription" : item.href} title={item.locked && moduleName ? `${moduleName} is not active` : item.label} className={`nav-link ${active ? "active" : ""} ${item.locked ? "locked" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.locked ? <small>Upgrade</small> : null}</Link>;
            })}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <Link className="nav-link" href="/workspaces"><Building2 size={18} /><span>Workspaces</span></Link>
          <Link className="nav-link" href="/profile"><UserRound size={18} /><span>Profile</span></Link>
          <a className="nav-link" href="mailto:support@businessos.bd"><CircleHelp size={18} /><span>Help & support</span></a>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-header">
          <div className="header-left"><button className="header-menu icon-button" title="Open navigation" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><span className="header-location">Workspace <span>/</span> <strong>{pathname.split("/")[1]?.replaceAll("-", " ") || "Dashboard"}</strong></span></div>
          <button className="global-search" type="button" onClick={() => setCommandOpen(true)}><Search size={16} /><span>Search pages and tools</span><kbd>Ctrl K</kbd></button>
          <div className="header-right">
            {tenant ? <label className="branch-switcher"><span className="online-dot" /><select value={selectedBranchId} disabled={Boolean(session.user.branchId)} onChange={(event) => void chooseBranch(event.target.value)} aria-label="Select operational branch"><option value="all">All branches</option>{tenant.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label> : null}
            <ThemeToggle />
            <button className="notification-button icon-button" title="Workspace status" aria-label="Workspace status" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((value) => !value)}><Activity size={18} /></button>
            <div className="user-summary"><span className="user-avatar">{session.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><span><strong>{session.user.name}</strong><small>{session.user.role}</small></span></div>
            <button className="icon-button signout" title="Sign out" aria-label="Sign out" onClick={logout}><LogOut size={18} /></button>
          </div>
          {notificationsOpen ? <div className="notification-panel"><div className="notification-panel-head"><strong>Workspace status</strong><button type="button" className="icon-button compact" aria-label="Close status" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{workspaceStatus.map((item, index) => <div className="notification-item" key={item}><span className={index === 2 && tenant?.storefrontStatus !== "published" ? "alert" : ""}><Activity size={14} /></span><p>{item}</p></div>)}</div> : null}
        </header>
        <main className="app-content">{signoutError ? <div className="form-alert" role="alert">{signoutError}</div> : null}{children}</main>
      </div>
      {commandOpen ? <CommandPalette items={commands.map((item) => ({ id: item.href, label: item.label, group: item.group, keywords: item.keywords ? [...item.keywords] : undefined, icon: item.iconComponent, badge: item.locked ? "Upgrade" : undefined, description: item.locked ? "Explore module activation" : item.group }))} onSelect={(id) => { const item = commands.find((command) => command.href === id); if (item) goTo(item); }} onClose={() => setCommandOpen(false)} footer={<><span>{activeBranch?.name ?? "All branches"}</span><span>Esc to close</span></>} /> : null}
    </div>
  );
}
