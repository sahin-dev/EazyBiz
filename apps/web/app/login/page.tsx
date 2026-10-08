import { Store } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-context">
        <div className="auth-context-inner">
          <span className="auth-context-logo"><Store size={27} /></span>
          <p className="overline light">BusinessOS Bangladesh</p>
          <h2>BusinessOS</h2>
          <p className="auth-intro">Your business workspace for sales, stock, and daily operations.</p>
          <div className="auth-context-footnote">Business workspace <span>/</span> Platform administration</div>
        </div>
      </section>
      <section className="auth-panel"><Suspense fallback={null}><LoginForm /></Suspense></section>
    </main>
  );
}
