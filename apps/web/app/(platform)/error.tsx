"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card" style={{ padding: 28 }}>
      <p className="eyebrow">Could not load workspace</p>
      <h2>Something went wrong while loading business data.</h2>
      <p className="muted">Check that the NestJS API and PostgreSQL database are running, then try again.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
