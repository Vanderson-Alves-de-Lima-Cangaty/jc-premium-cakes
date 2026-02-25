import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const GRADIENTS = [
  "from-primary/20 via-card to-card",
  "from-primary/25 via-primary/5 to-card",
  "from-primary/15 via-transparent to-card",
];

// Uses a simple hashing function on a seed (e.g., product ID) to pick a gradient.
// This ensures deterministic output, avoiding SSR hydration mismatches.
function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface ArtTileProps extends React.HTMLAttributes<HTMLDivElement> {
  seed: string;
  label?: string;
}

export function ArtTile({ seed, label, className, ...props }: ArtTileProps) {
  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];
  const letters =
    (label ?? seed)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 3) || "JC";

  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-xl border bg-gradient-to-br",
        gradient,
        className
      )}
      {...props}
    >
      {/* Subtle highlights */}
      <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_45%),radial-gradient(circle_at_70%_70%,hsl(var(--primary)/0.08),transparent_40%)]" />

      {/* Animated shine effect on hover of a parent with "group" class */}
      <div className="absolute inset-0 -translate-x-full rotate-[-30deg] bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 ease-in-out-circ group-hover:translate-x-full" />
      
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="text-xs font-semibold text-muted-foreground">
          Premiun cakes jc
        </div>
        <div className="self-end rounded-lg bg-black/30 px-3 py-2 text-sm font-extrabold tracking-widest text-foreground/90 backdrop-blur-sm">
          {letters}
        </div>
      </div>
    </div>
  );
}
