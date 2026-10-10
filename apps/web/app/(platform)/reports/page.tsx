import { BarChart3 } from "lucide-react";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/primitives";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function ReportsPage({ searchParams }: { searchParams: { days?: string } }) {
  const session = await api.session();
  const { tenant } = session;
  if (!tenant) redirect("/platform-admin");
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const report = await api.report(tenant.id, days, workspaceBranchId(session));
  const max = Math.max(1, ...report.daily.map((day) => Math.abs(day.sales)));
  const maxPayment = Math.max(1, ...report.paymentMix.map((entry) => Math.abs(entry.amount)));
  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Performance</p><h1>Reports</h1><p className="page-description">Net sales, returns, and actual payment activity.</p></div><div className="report-range" role="group" aria-label="Report period">{[7, 30, 90].map((value) => <a key={value} className={days === value ? "active" : ""} href={`/reports?days=${value}`}>{value} days</a>)}</div></div><div className="inventory-summary report-summary"><div><span>Net sales</span><strong>{formatMoney(report.totalSales)}</strong></div><div><span>Orders</span><strong>{report.orderCount}</strong></div><div><span>Returns</span><strong>{report.returnCount}</strong></div><div><span>Refunded payments</span><strong>{formatMoney(report.refundAmount)}</strong></div></div><div className="report-layout"><section className="surface"><div className="surface-heading"><div><h2>Daily net sales</h2><p>Returns are applied on their return date</p></div></div>{report.daily.length ? <div className="report-chart" role="img" aria-label="Daily net sales bar chart">{report.daily.map((day) => <div key={day.date} title={`${day.date}: ${formatMoney(day.sales)}; ${day.returns} returns`}><span className={day.sales < 0 ? "negative" : ""} style={{ height: `${Math.max(3, Math.abs(day.sales) / max * 100)}%` }} /><small>{new Date(day.date).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}</small></div>)}</div> : <EmptyState icon={<BarChart3 size={28} />} title="No sales for this period" detail="Completed orders will appear in this report." />}</section><section className="surface"><div className="surface-heading"><div><h2>Payment activity</h2><p>Captured payments less recorded refunds</p></div></div><div className="payment-mix">{report.paymentMix.map((entry) => <div key={entry.method}><span>{entry.method}</span><strong>{formatMoney(entry.amount)}</strong><i className={entry.amount < 0 ? "negative" : ""} style={{ width: `${Math.abs(entry.amount) / maxPayment * 100}%` }} /></div>)}{!report.paymentMix.length ? <EmptyState icon={<BarChart3 size={28} />} title="No payments yet" detail="Payment breakdown appears after your first sale." /> : null}</div></section></div></div>;
}
