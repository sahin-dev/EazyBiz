"use client";

import { ArrowRight, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { businessTypeOptions } from "@businessos/domain";

type Mode = "signup" | "forgot-password" | "reset-password" | "verify-email";

const title: Record<Mode, string> = {
  signup: "Create your business workspace",
  "forgot-password": "Reset your password",
  "reset-password": "Choose a new password",
  "verify-email": "Verify your email",
};

export function AccountFlow({ mode }: { mode: Mode }) {
  const search = useSearchParams();
  const token = search.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const payload = mode === "verify-email" && token ? { token } : mode === "reset-password" ? { token, password: fields.password } : fields;
    const action = mode === "verify-email" && !token ? "resend-verification" : mode;
    try {
      const response = await fetch(`/api/auth/public/${action}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message ?? "Unable to complete your request.");
      setSuccess(result.message ?? "Done.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Service is unavailable."); }
    finally { setLoading(false); }
  }

  const field = (label: string, name: string, type = "text", autocomplete?: string, placeholder?: string) => <label className="field" key={name}>
    <span>{label}</span><span className="input-with-icon"><input name={name} type={type} autoComplete={autocomplete} placeholder={placeholder} required minLength={type === "password" ? 8 : undefined} maxLength={type === "password" ? 128 : undefined} /></span>
  </label>;

  return <form className="auth-form" onSubmit={submit}>
    <div className="auth-brand"><span className="brand-symbol"><Building2 size={21} /></span><div><strong>BusinessOS</strong><span>Bangladesh</span></div></div>
    <div className="auth-heading"><p className="overline">Account access</p><h1>{title[mode]}</h1></div>
    {error ? <div className="form-alert" role="alert">{error}</div> : null}
    {success ? <div className="notice success" role="status">{success}</div> : null}
    {!success ? <>
      {mode === "signup" ? <>
        {field("Your name", "ownerName", "text", "name")}
        {field("Business name", "name", "text", "organization")}
        <label className="field"><span>Business type</span><select name="businessType" className="account-select" defaultValue="retail">{businessTypeOptions().map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        {field("Business phone", "phone", "tel", "tel", "01XXXXXXXXX")}
        {field("Main branch name", "branchName", "text", undefined, "Main branch")}
        {field("Main branch address", "branchAddress", "text", "street-address")}
      </> : null}
      {(mode === "signup" || mode === "forgot-password" || (mode === "verify-email" && !token)) ? field("Email address", "email", "email", "email") : null}
      {(mode === "signup" || mode === "reset-password") ? field(mode === "signup" ? "Password" : "New password", "password", "password", "new-password") : null}
      {mode === "reset-password" && !token ? <div className="form-alert" role="alert">This link is missing its token. Request a new link.</div> : null}
      <button className="button primary auth-submit" type="submit" disabled={loading || (mode === "reset-password" && !token)}>{loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}{loading ? "Please wait" : mode === "signup" ? "Create workspace" : mode === "forgot-password" ? "Send reset link" : mode === "reset-password" ? "Update password" : token ? "Verify email" : "Resend verification"}</button>
    </> : null}
    <p className="auth-note"><Link href="/login">Back to sign in</Link>{mode === "forgot-password" ? <> · <Link href="/signup">Create a workspace</Link></> : null}</p>
  </form>;
}
