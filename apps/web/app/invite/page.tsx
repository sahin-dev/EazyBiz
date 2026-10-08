import { Building2, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import { InviteForm } from "./invite-form";

export default function InvitePage() {
  return <main className="invite-page"><section className="invite-context"><div className="invite-brand"><Building2 size={21} /><strong>BusinessOS</strong></div><p className="page-kicker">Your business workspace</p><h1>Start working with your team.</h1><p>Set your password to activate your account and access the business workspace.</p><div className="invite-context-foot"><ShieldCheck size={19} />Your invitation is private and expires after 48 hours.</div></section><section className="invite-form-panel"><Suspense fallback={null}><InviteForm /></Suspense></section></main>;
}
