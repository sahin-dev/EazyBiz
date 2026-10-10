import { Store } from "lucide-react";

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return <main className="auth-page">
    <section className="auth-context"><div className="auth-context-inner">
      <span className="auth-context-logo"><Store size={27} /></span>
      <p className="overline light">BusinessOS Bangladesh</p>
      <h2>BusinessOS</h2>
      <p className="auth-intro">A clear view of your business, from the first sale to the last stock count.</p>
    </div></section>
    <section className="auth-panel">{children}</section>
  </main>;
}
