import { moduleCatalog, planCatalog } from "@businessos/domain";
import { Check } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

export default function PricingPage() {
  const availableModules = moduleCatalog.filter((module) => module.available);
  return (
    <main className="public-page">
      <section className="public-hero">
        <div>
          <p className="eyebrow">SaaS pricing</p>
          <h1>Plans that scale by branch, users, devices, storage, SMS, and modules.</h1>
          <p>Start with a base subscription, add only the operational modules you need, and keep room for future payment providers.</p>
          <Link className="button primary" href="/signup">Start free trial</Link>
        </div>
      </section>
      <section className="pricing-grid">
        {planCatalog.map((plan) => (
          <article className={`card pricing-card ${plan.highlighted ? "highlight" : ""}`} key={plan.code}>
            <div className="card-header"><div><h2>{plan.name}</h2><p>{plan.description}</p></div></div>
            <strong className="price">{formatMoney(plan.monthlyBasePrice)}<span>/month</span></strong>
            <ul>
              <li><Check size={16} /> {plan.limits.branches ?? "Unlimited"} branches</li>
              <li><Check size={16} /> {plan.limits.users ?? "Unlimited"} users</li>
              <li><Check size={16} /> {plan.limits.devices ?? "Unlimited"} devices</li>
              <li><Check size={16} /> {plan.limits.storageGb ?? "Unlimited"} GB storage</li>
              <li><Check size={16} /> {plan.limits.sms ?? "Unlimited"} SMS/month</li>
            </ul>
          </article>
        ))}
      </section>
      <section className="card admin-section">
        <div className="card-header"><div><h2>Modular add-ons</h2><p>Enable vertical workflows and operational modules independently.</p></div></div>
        <div className="module-catalog">
          {availableModules.map((module) => (
            <div className="module-row" key={module.id}>
              <span><strong>{module.name}</strong><small>{module.summary}</small></span>
              <span>{formatMoney(module.monthlyPrice)} / month</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

