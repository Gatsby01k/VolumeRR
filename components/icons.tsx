export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`arrow ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: up ? "rotate(180deg)" : undefined }}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function Close() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M6 18 18 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
