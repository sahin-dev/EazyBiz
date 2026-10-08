"use client";

import { ArrowRight, Building2, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, Store } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type WorkspaceType = "business" | "platform";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const initialWorkspace = search.get("workspace") === "platform" || search.get("next")?.startsWith("/platform-admin") ? "platform" : "business";
  const [workspace, setWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, workspace }) });
    const payload = (await response.json()) as { message?: string; user?: { role?: string } };
    if (!response.ok) {
      setError(payload.message ?? "Unable to sign in.");
      setLoading(false);
      return;
    }
    const next = search.get("next");
    const fallback = payload.user?.role === "platformAdmin" ? "/platform-admin" : "/dashboard";
    const scopedNext = next?.startsWith("/") && !next.startsWith("//") && (workspace === "platform" ? next.startsWith("/platform-admin") : !next.startsWith("/platform-admin"));
    router.replace(scopedNext && next ? next : fallback);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-brand">
        <span className="brand-symbol"><Building2 size={21} /></span>
        <div><strong>BusinessOS</strong><span>Bangladesh</span></div>
      </div>
      <div className="auth-heading">
        <p className="overline">{workspace === "platform" ? "Platform control" : "Business workspace"}</p>
        <h1>{workspace === "platform" ? "Sign in to platform admin" : "Sign in to your business"}</h1>
        <p>{workspace === "platform" ? "Manage tenants, subscriptions, modules, and payment review." : "Manage sales, inventory, people, and your online store from one place."}</p>
      </div>
      <div className="auth-workspace-toggle" aria-label="Choose login workspace">
        <button type="button" className={workspace === "business" ? "selected" : ""} onClick={() => { setWorkspace("business"); setError(""); }}>
          <Store size={17} />
          <span><strong>Business users</strong><small>Owners, managers, cashiers, staff</small></span>
        </button>
        <button type="button" className={workspace === "platform" ? "selected" : ""} onClick={() => { setWorkspace("platform"); setError(""); }}>
          <ShieldCheck size={17} />
          <span><strong>Platform admins</strong><small>SaaS operations team only</small></span>
        </button>
      </div>
      {error ? <div className="form-alert" role="alert">{error}</div> : null}
      <label className="field">
        <span>Email address</span>
        <span className="input-with-icon"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></span>
      </label>
      <label className="field">
        <span>Password</span>
        <span className="input-with-icon"><LockKeyhole size={17} /><input type={visible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" className="icon-button compact" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
      </label>
      <button className="button primary auth-submit" disabled={loading}>
        {loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />} {loading ? "Signing in" : "Sign in"}
      </button>
      <p className="auth-note">{workspace === "platform" ? "Only platform administrator accounts can enter this console." : "Use the credentials provided by your workspace administrator."}</p>
    </form>
  );
}
