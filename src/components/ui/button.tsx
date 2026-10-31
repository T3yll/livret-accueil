import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-primary text-white hover:opacity-90",
  secondary: "border border-border bg-surface text-text hover:bg-stone",
  danger: "border border-favorite bg-surface text-favorite hover:bg-favorite-bg",
};

type Variant = keyof typeof variants;

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
