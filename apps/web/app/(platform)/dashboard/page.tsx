import { ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, CircleAlert, CreditCard, ShoppingBag, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { businessTypeConfigs, hasPermission } from "@businessos/domain";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { workspaceBranchId } from "@/lib/workspace-branch";
import { workspaceHome } from "@/lib/workspace-home";

export default async function DashboardPage() {
  const session = await api.session();
  const { tenant, user } = session;
  if (!tenant) redirect("/platform-admin");
  if (!hasPermission(user.role, "dashboard:view")) redirect(workspaceHome(user.role, tenant.enabledModules));
  const branchId = workspaceBranchId(session);
  const [data, inventory] = await Promise.all([api.dashboard(tenant.id, branchId), api.inventory(tenant.id, branchId)]);
  const canSell = hasPermission(user.role, "sale:create") && tenant.enabledModules.includes("pos");
  const canManageProducts = hasPermission(user.role, "product:manage") && tenant.enabledModules.includes("inventory");
  const canViewInventory = hasPermission(user.role, "inventory:view") && tenant.enabledModules.includes("inventory");
  const canViewCustomers = hasPermission(user.role, "customer:view") && tenant.enabledModules.includes("customers");
  const canViewReports = hasPermission(user.role, "report:view") && tenant.enabledModules.includes("reports");
  const businessName = businessTypeConfigs[tenant.businessType].name;
  const metrics = [
    { label: "Today's sales", value: formatMoney(data.metrics.sales), icon: CreditCard, detail: `${data.metrics.orderCount} completed orders`, trend: "Sales today", tone: "green" },
    { label: "Orders today", value: data.metrics.orderCount.toLocaleString(), icon: ShoppingBag, detail: `Avg. ${formatMoney(data.metrics.averageOrder)}`, trend: "Orders", tone: "blue" },
    { label: "Low stock items", value: data.metrics.lowStockCount.toLocaleString(), icon: CircleAlert, detail: "Below reorder level", trend: "Needs attention", tone: "amber" },
    { label: "Stock value", value: formatMoney(data.metrics.stockValue), icon: Boxes, detail: `${inventory.summary.skuCount} stocked products`, trend: "At purchase cost", tone: "violet" },
  ];
  return <div className="page-stack">
    <div className="page-heading dashboard-heading">
      <div><p className="page-kicker">{businessName} overview</p><h1>Good to see you, {user.name.split(" ")[0]}</h1><p className="page-description">A clear view of your business today.</p></div>
      <div className="heading-actions"><span className="date-pill">{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</span>{canSell ? <Link href="/pos" className="button primary"><ShoppingBag size={17} /> New sale</Link> : null}</div>
    </div>
    <div className="stat-grid">{metrics.map(({ label, value, detail, trend, tone, icon: Icon }) => <div className="stat-tile" key={label}><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={19} /></span></div><strong>{value}</strong><div className="stat-foot"><span>{detail}</span><small>{trend}</small></div></div>)}</div>
    <div className="dashboard-columns">
      <section className="surface"><div className="surface-heading"><div><h2>Recent orders</h2><p>Sales from your branch and online storefront</p></div><Link href="/orders" className="text-action">View all <ArrowRight size={16} /></Link></div>
        <div className="table-wrap"><table className="data-grid"><thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th className="numeric">Amount</th></tr></thead><tbody>
          {data.recentOrders.length ? data.recentOrders.map((order) => <tr key={order.id}><td><strong>{order.orderNo}</strong><small>{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit" }).format(new Date(order.createdAt))}</small></td><td>{order.customer?.name ?? "Walk-in"}</td><td>{order.paymentMethod}</td><td><span className="status-dot"><i />{order.status}</span></td><td className="numeric strong">{formatMoney(order.total)}</td></tr>) : <tr><td colSpan={5}><div className="table-empty">No sales yet today. Your latest order will appear here.</div></td></tr>}
        </tbody></table></div>
      </section>
      <section className="surface"><div className="surface-heading"><div><h2>Top products</h2><p>Most ordered today</p></div><span className="mini-icon"><ArrowUpRight size={17} /></span></div>
        <div className="ranking-list">{data.topProducts.length ? data.topProducts.map((item, index) => <div className="ranking-row" key={item.name}><span className="rank-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{item.name}</strong><small>{item.quantity} sold</small></span><strong>{formatMoney(item.sales)}</strong></div>) : <div className="panel-empty"><ShoppingBag size={25} /><strong>No product sales yet</strong><span>Your best sellers will appear as soon as sales are recorded.</span></div>}</div>
      </section>
    </div>
    <div className="dashboard-bottom">
      <section className="surface attention-panel"><div className="surface-heading"><div><h2>Needs attention</h2><p>Operational items to review</p></div><CircleAlert size={18} /></div><div className="attention-list">{canViewInventory ? <Link href="/inventory"><span className="attention-icon amber"><Boxes size={18} /></span><span><strong>{data.metrics.lowStockCount} low stock items</strong><small>Review reorder levels and purchase requirements</small></span><ArrowRight size={17} /></Link> : null}{canViewCustomers ? <Link href="/customers"><span className="attention-icon red"><ArrowDownRight size={18} /></span><span><strong>{formatMoney(data.metrics.dueAmount)} due today</strong><small>Outstanding customer balances on today&apos;s orders</small></span><ArrowRight size={17} /></Link> : null}</div></section>
      <section className="surface quick-panel"><div className="surface-heading"><div><h2>Quick access</h2><p>Common tasks for your team</p></div></div><div className="quick-grid">{canSell ? <Link href="/pos"><ShoppingBag size={21} /><strong>New sale</strong></Link> : null}{canManageProducts ? <Link href="/products"><Boxes size={21} /><strong>Add product</strong></Link> : null}{canViewInventory ? <Link href="/inventory"><Boxes size={21} /><strong>Inventory</strong></Link> : null}{canViewCustomers ? <Link href="/customers"><UsersRound size={21} /><strong>Customers</strong></Link> : null}{canViewReports ? <Link href="/reports"><ArrowUpRight size={21} /><strong>Reports</strong></Link> : null}</div></section>
    </div>
  </div>;
}
