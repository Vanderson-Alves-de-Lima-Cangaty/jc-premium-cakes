"use client";

import { ArtTile } from "@/components/ArtTile";
import { Container } from "@/components/Container";
import { PriceBar } from "@/components/PriceBar";
import { QtyControl } from "@/components/QtyControl";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/money";
import type { CartItem } from "@/server/pricing";
import { describeItem, lineTotalCents } from "@/server/pricing";
import { useCartStore } from "@/store/cart";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Sub-component for rendering a single cart item
function CartItemCard({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  const description = describeItem(item);
  const total = lineTotalCents(item);

  return (
    <Card className="p-4 transition-all hover:shadow-medium">
      {/* Changed flex direction for better mobile responsiveness */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* ArtTile takes full width on small screens, fixed width on sm+ */}
        <div className="w-full sm:w-24 md:w-32 flex-shrink-0">
          <ArtTile seed={description.title} label={description.title.slice(0, 3)} />
        </div>

        {/* Item details */}
        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-foreground">{description.title}</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {description.lines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
          <div className="pt-2">
            <QtyControl value={item.qty} onChange={onUpdateQty} />
          </div>
        </div>

        {/* Price and Remove Button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-2 mt-4 sm:mt-0">
          <div className="text-lg font-bold text-foreground">{formatMoney(total)}</div>
          <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Remover item">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Sub-component for the empty cart state
function EmptyCart() {
  return (
    <Card className="flex flex-col items-center justify-center p-10 text-center">
      <h2 className="text-xl font-bold">Seu carrinho está vazio</h2>
      <p className="mt-2 text-muted-foreground">
        Que tal adicionar um bolo delicioso?
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/vulcao">Ver Bolos Vulcão</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/bolo-10">Montar Bolo 10 Pessoas</Link>
        </Button>
      </div>
    </Card>
  );
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeAt = useCartStore((s) => s.removeAt);
  const updateQty = useCartStore((s) => s.updateQty);
  const subtotal = useCartStore((s) => s.subtotalCents());
  const toast = useToast();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const safeItems = isMounted ? items : [];

  if (!isMounted) {
    return (
      <Container className="py-10">
        <Card className="p-10 text-center"><h2 className="text-xl font-bold">Carregando seu carrinho...</h2></Card>
      </Container>
    );
  }

  if (safeItems.length === 0) {
    return (
        <main>
            <Container className="py-10 space-y-6">
                 <h1 className="text-3xl font-extrabold tracking-tighter">Carrinho</h1>
                 <EmptyCart />
            </Container>
        </main>
    )
  }

  return (
    <main>
      {/* Increased bottom padding for mobile to account for the sticky PriceBar */}
      <Container className="pb-36 lg:pb-10 py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Item List */}
          <div className="space-y-6 lg:col-span-2">
            <h1 className="text-3xl font-extrabold tracking-tighter">Seu Carrinho ({safeItems.length})</h1>
            <div className="space-y-4">
              {safeItems.map((item, idx) => (
                <CartItemCard
                  key={idx}
                  item={item}
                  onUpdateQty={(qty) => updateQty(idx, qty)}
                  onRemove={() => {
                    toast.success("Item removido");
                    removeAt(idx);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Desktop Summary */}
          <div className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-xl font-bold">Resumo</h2>
              <div className="mt-4 flex justify-between text-lg">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground" suppressHydrationWarning>
                  {formatMoney(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                A taxa de entrega será calculada na próxima etapa.
              </p>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link href="/finalizar">Finalizar Pedido</Link>
              </Button>
            </Card>
          </div>
        </div>
      </Container>

      {/* Mobile Price Bar */}
      <PriceBar
        price={
           <div className="text-left">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="text-xl font-extrabold text-foreground">{formatMoney(subtotal)}</div>
          </div>
        }
        action={
            <Button asChild>
              <Link href="/finalizar">Finalizar</Link>
            </Button>
        }
      />
    </main>
  );
}
