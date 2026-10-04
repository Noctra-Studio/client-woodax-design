import { ArrowRight } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const variants = {
  "design-primary":
    "rounded-full bg-woodax-charcoal text-woodax-cream pointer-fine:hover:bg-woodax-charcoal/90 focus-visible:outline-woodax-cream",
  "design-secondary":
    "rounded-full border border-woodax-charcoal text-woodax-charcoal pointer-fine:hover:bg-woodax-sand focus-visible:outline-woodax-charcoal",
  "cnc-primary":
    "rounded-[4px] bg-cnc-white text-cnc-bg pointer-fine:hover:bg-cnc-text focus-visible:outline-cnc-white",
  "cnc-secondary":
    "rounded-[4px] border border-cnc-line text-cnc-text pointer-fine:hover:border-cnc-muted pointer-fine:hover:bg-cnc-surface focus-visible:outline-cnc-text",
} as const;

type CommonProps = {
  variant: keyof typeof variants;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

export function Button({
  variant,
  arrow = false,
  className,
  children,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = cn(
    "group inline-flex min-h-11 items-center justify-center gap-2 px-5 text-base font-medium transition-[transform,background-color,border-color] duration-(--duration-press) ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
    variants[variant],
    className,
  );
  const content = (
    <>
      {children}
      {arrow ? (
        <ArrowRight
          aria-hidden
          strokeWidth={1.5}
          className="size-4 transition-transform duration-(--duration-press) ease-out motion-reduce:transition-none pointer-fine:group-hover:translate-x-1"
        />
      ) : null}
    </>
  );

  if ("href" in props && typeof props.href === "string") {
    return (
      <a className={classes} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type={props.type ?? "button"} className={classes} {...props}>
      {content}
    </button>
  );
}
