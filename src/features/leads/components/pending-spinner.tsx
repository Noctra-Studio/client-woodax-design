export function PendingSpinner() {
  return (
    <div className="size-4 animate-spin motion-reduce:animate-none" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-4">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.35"
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
