import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { cn } from "cn";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** `up-right` = link de avance; `back` = volver; `none` = sin ícono */
  icon?: "up-right" | "back" | "none";
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function TextLink({
  href,
  children,
  className,
  icon = "up-right",
  target,
  rel,
  onClick,
}: Props) {
  const Icon =
    icon === "back" ? ArrowLeft : icon === "up-right" ? ArrowUpRight : null;

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={cn(
        "group/text-link inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-[var(--primary-hover)]",
        className
      )}
    >
      {Icon && icon === "back" ? (
        <Icon
          className="size-3.5 shrink-0 transition-transform duration-200 group-hover/text-link:-translate-x-0.5"
          aria-hidden
        />
      ) : null}
      <span className="underline decoration-primary/30 underline-offset-4 transition-[text-decoration-color] group-hover/text-link:decoration-primary/70">
        {children}
      </span>
      {Icon && icon === "up-right" ? (
        <Icon
          className="size-3.5 shrink-0 transition-transform duration-200 group-hover/text-link:translate-x-0.5 group-hover/text-link:-translate-y-0.5"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
