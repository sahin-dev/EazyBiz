"use client";

import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Notice } from "@/components/ui/primitives";

export function InviteForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/accept-invitation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password }) });
      const payload = (await response.json()) as { message?: string | string[] };
      if (!response.ok) throw new Error(Array.isArray(payload.message) ? payload.message.join(" ") : payload.message ?? "Unable to activate your account.");
      setAccepted(true); setPassword(""); setConfirm("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to activate your account."); }
    finally { setBusy(false); }
  }

  return (
    <div className="invite-form-inner">
      <p className="page-kicker">Account activation</p>
      <h2>{accepted ? "Your account is ready" : "Choose your password"}</h2>
      <p className="page-description">{accepted ? "You can now sign in to your business workspace." : "Use a unique password with at least 12 characters."}</p>
      {accepted ? (
        <Link href="/login" className="button primary invite-signin">Go to sign in <ArrowRight size={17} /></Link>
      ) : token ? (
        <form className="drawer-form" onSubmit={submit}>
          {error ? <Notice message={error} tone="error" /> : null}
          <label className="form-field">
            <span>Password</span>
            <span className="invite-password">
              <LockKeyhole size={17} />
              <input type={visible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={72} required />
              <button type="button" className="icon-button" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </span>
          </label>
          <label className="form-field">
            <span>Confirm password</span>
            <input type={visible ? "text" : "password"} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={12} maxLength={72} required />
          </label>
          <button className="button primary invite-signin" disabled={busy}>{busy ? "Activating..." : "Activate account"}<ArrowRight size={17} /></button>
        </form>
      ) : <Notice message="This invitation link is incomplete. Ask your workspace administrator for a new link." tone="error" />}
    </div>
  );
}
