"use client";

import { Loader2, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { SessionData } from "@/lib/types";

type ActiveSession = { id: string; tenantId: string | null; createdAt: string; expiresAt: string; userAgent: string | null };

export function ProfileManager({ session, sessions }: { session: SessionData; sessions: ActiveSession[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("profile"); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/backend/auth/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to update your profile.");
      setSuccess("Profile updated."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update your profile."); }
    finally { setBusy(""); }
  }

  async function revoke(id: string) {
    setBusy(id); setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/backend/auth/sessions/${id}/revoke`, { method: "POST", headers: { "content-type": "application/json" } });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to revoke this session.");
      if (id === session.user.sessionId) { router.replace("/login"); router.refresh(); }
      else { setSuccess("Session revoked."); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to revoke this session."); }
    finally { setBusy(""); }
  }

  return <div className="account-page">
    <header className="account-heading"><p className="overline">Account</p><h1>Your profile</h1><p>Manage your details and signed-in devices.</p></header>
    {error ? <div className="form-alert" role="alert">{error}</div> : null}
    {success ? <div className="notice success" role="status">{success}</div> : null}
    <section aria-labelledby="profile-heading"><h2 id="profile-heading">Personal details</h2>
      <form className="account-grid" onSubmit={save}>
        <label className="field"><span>Name</span><input name="name" defaultValue={session.user.name} required minLength={2} maxLength={100} /></label>
        <label className="field"><span>Phone</span><input name="phone" type="tel" defaultValue={session.user.phone ?? ""} required placeholder="01XXXXXXXXX" /></label>
        <div className="field account-wide"><span>Email</span><div className="account-readonly">{session.user.email}</div></div>
        <button className="button primary" disabled={Boolean(busy)}>{busy === "profile" ? <Loader2 className="spin" size={16} /> : null}Save profile</button>
      </form>
    </section>
    <section className="account-section" aria-labelledby="sessions-heading"><h2 id="sessions-heading">Active sessions</h2>
      {sessions.length ? <div className="workspace-list">{sessions.map((item) => <div className="workspace-row" key={item.id}>
        <span className="workspace-icon"><ShieldCheck size={19} /></span><div><strong>{item.userAgent || "Browser session"}</strong><small>Signed in {new Date(item.createdAt).toLocaleString("en-BD")} {item.id === session.user.sessionId ? "· This device" : ""}</small></div>
        <button className="icon-button" type="button" title="Sign out session" aria-label="Sign out session" disabled={Boolean(busy)} onClick={() => void revoke(item.id)}>{busy === item.id ? <Loader2 className="spin" size={17} /> : <X size={17} />}</button>
      </div>)}</div> : <p className="account-empty">No active sessions.</p>}
    </section>
  </div>;
}
