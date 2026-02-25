"use client";

import { Container } from "@/components/Container";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";

const ShoppingBagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export function Header() {
  const count = useCartStore((s) => s.countItems());

  // Prevents hydration mismatch: SSR shows 0, then client-side value after mounting.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const displayCount = mounted ? count : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          Premiun cakes jc
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
          <Button variant="ghost" asChild>
            <Link href="/vulcao">Mini Vulcão</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/bolo-10">Bolo 10 Pessoas</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/carrinho" aria-label="Carrinho">
              <div className="relative">
                <ShoppingBagIcon className="h-5 w-5" />
                {displayCount > 0 && (
                  <span
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                    suppressHydrationWarning
                  >
                    {displayCount}
                  </span>
                )}
              </div>
            </Link>
          </Button>
          {/* A button for the mobile menu can be added here later */}
        </div>
      </Container>
    </header>
  );
}

// We need to add `asChild` to our button props to make this work.
// Let's modify the Button component.
