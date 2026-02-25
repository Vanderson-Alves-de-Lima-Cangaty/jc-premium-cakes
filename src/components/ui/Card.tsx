import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// This is a standard helper function for combining tailwind classes.
// It uses `clsx` to conditionally join class names and `tailwind-merge`
// to intelligently merge Tailwind CSS classes without style conflicts.
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/75 text-card-foreground shadow-soft backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}
