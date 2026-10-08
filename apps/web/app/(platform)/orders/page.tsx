import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState, StatusBadge } from "@/components/ui/primitives";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function OrdersPage() {
  const session = await api.session();
  const { tenant } = session;
  if (!tenant) redirect("/platform-admin");
  const branchId = workspaceBranchId(session);
  const orders = await api.orders(tenant.id, branchId);
  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Sales ledger</p><h1>Orders</h1><p className="page-description">Every completed sale, payment, and outstanding balance.</p></div><Link className="button primary" href="/pos">New sale</Link></div><section className="surface"><div className="table-wrap"><table className="data-grid"><thead><tr><th>Order</th><th>Created</th><th>Source</th><th>Items</th><th>Payment</th><th>Status</th><th className="numeric">Total</th><th className="numeric">Due</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.orderNo}</strong></td><td>{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</td><td>{order.source}</td><td>{order.items?.length ?? 0}</td><td>{order.paymentMethod}</td><td><StatusBadge label={order.paymentStatus} tone={order.paymentStatus === "captured" ? "success" : "warning"} /></td><td className="numeric strong">{formatMoney(order.total)}</td><td className="numeric">{formatMoney(order.dueAmount)}</td></tr>)}</tbody></table>{orders.length === 0 ? <EmptyState icon={<ClipboardList size={28} />} title="No orders yet" detail="Sales completed in POS will appear here." /> : null}</div></section></div>;
}
