"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section dark">
      <div className="wrap">
        <span className="eyebrow">LET’S TRY THAT AGAIN</span>
        <h1>A pause in the flow.</h1>
        <p>
          This page could not load. Your saved market choices are still in this
          session.
        </p>
        <button className="button" onClick={reset}>
          Try again ↗
        </button>
      </div>
    </section>
  );
}
