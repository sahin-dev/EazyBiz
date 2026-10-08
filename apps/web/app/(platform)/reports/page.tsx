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
  const max = Math.max(1, ...report.daily.map((day) => day.sales));
  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Performance</p><h1>Reports</h1><p className="page-description">Sales performance and payment mix across your business.</p></div><div className="report-range" role="group" aria-label="Report period">{[7, 30, 90].map((value) => <a key={value} className={days === value ? "active" : ""} href={`/reports?days=${value}`}>{value} days</a>)}</div></div><div className="inventory-summary"><div><span>Total sales</span><strong>{formatMoney(report.totalSales)}</strong></div><div><span>Orders</span><strong>{report.orderCount}</strong></div><div><span>Average order</span><strong>{formatMoney(report.orderCount ? report.totalSales / report.orderCount : 0)}</strong></div></div><div className="report-layout"><section className="surface"><div className="surface-heading"><div><h2>Daily sales</h2><p>Revenue over the selected period</p></div></div>{report.daily.length ? <div className="report-chart" role="img" aria-label="Daily sales bar chart">{report.daily.map((day) => <div key={day.date} title={`${day.date}: ${formatMoney(day.sales)}`}><span style={{ height: `${Math.max(3, day.sales / max * 100)}%` }} /><small>{new Date(day.date).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}</small></div>)}</div> : <EmptyState icon={<BarChart3 size={28} />} title="No sales for this period" detail="Completed orders will appear in this report." />}</section><section className="surface"><div className="surface-heading"><div><h2>Payment mix</h2><p>Sales by payment method</p></div></div><div className="payment-mix">{report.paymentMix.map((entry) => <div key={entry.method}><span>{entry.method}</span><strong>{formatMoney(entry.amount)}</strong><i style={{ width: `${report.totalSales ? entry.amount / report.totalSales * 100 : 0}%` }} /></div>)}{!report.paymentMix.length ? <EmptyState icon={<BarChart3 size={28} />} title="No payments yet" detail="Payment breakdown appears after your first sale." /> : null}</div></section></div></div>;
}
