import { cn } from "@/lib/utils";

export function RegistrationMarks({
  className,
  edges = "both",
}: {
  className?: string;
  edges?: "both" | "top" | "bottom";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-4 md:inset-6", className)}
    >
      {edges !== "bottom" ? (
        <>
          <Mark className="absolute top-0 left-0" />
          <Mark className="absolute top-0 right-0" />
        </>
      ) : null}
      {edges !== "top" ? (
        <>
          <Mark className="absolute bottom-0 left-0" />
          <Mark className="absolute right-0 bottom-0" />
        </>
      ) : null}
    </div>
  );
}

function Mark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 12 12" className={cn("size-3 text-cnc-muted", className)}>
      <path
        d="M6 0v12M0 6h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
