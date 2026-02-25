"use client";

import { Container } from "@/components/Container";

interface PriceBarProps {
  price: React.ReactNode;
  controls?: React.ReactNode;
  action: React.ReactNode;
}

/**
 * A bar that sticks to the bottom of the screen on mobile, showing price and a CTA.
 * Gracefully hides on larger screens.
 */
export function PriceBar({ price, controls, action }: PriceBarProps) {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-50 w-full md:hidden">
      <div className="pointer-events-auto border-t border-border bg-background/95 p-4 backdrop-blur-sm">
        <Container className="flex items-center justify-between gap-4">
          <div className="flex-1">{price}</div>
          {controls && <div className="flex-shrink-0">{controls}</div>}
          <div className="flex-shrink-0">{action}</div>
        </Container>
      </div>
    </div>
  );
}
