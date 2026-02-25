"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import {
  CATALOG,
  type Massa,
  type VulcaoAddonId,
  type VulcaoFlavorId,
} from "@/server/catalog";
import { OptionGrid } from "@/components/OptionGrid";
import { Button } from "@/components/ui/Button";
import { QtyControl } from "@/components/QtyControl";
import { useCartStore } from "@/store/cart";
import { formatMoney } from "@/lib/money";
import { ArtTile } from "@/components/ArtTile";
import { useToast } from "@/components/ToastProvider";
import { PriceBar } from "@/components/PriceBar";

export default function VulcaoFlavorPage() {
  const params = useParams<{ flavor: string }>();
  const router = useRouter();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const flavorId = params.flavor as VulcaoFlavorId;
  const flavor = CATALOG.vulcao.flavors.find((f) => f.id === flavorId);

  const [massa, setMassa] = useState<Massa | null>(null);
  const [addons, setAddons] = useState<VulcaoAddonId[]>([]);
  const [qty, setQty] = useState<number>(1);

  const totalCents = useMemo(() => {
    const base = CATALOG.vulcao.basePriceCents;
    const addCents = addons.reduce(
      (s, id) =>
        s +
        (CATALOG.vulcao.addons.find((a) => a.id === id)?.priceCents ?? 0),
      0
    );
    return (base + addCents) * qty;
  }, [addons, qty]);

  if (!flavor) {
    return (
      <main>
        <Container className="py-10">
          <h1 className="text-2xl font-bold">Sabor não encontrado.</h1>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </Container>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!massa) {
      toast.error("Escolha a massa para continuar.");
      return;
    }
    addItem({ kind: "vulcao", flavorId, massa, addons, qty });
    toast.success("Adicionado ao carrinho!", flavor.name);
    router.push("/carrinho");
  };
  
  const addonOptions = CATALOG.vulcao.addons.map(a => ({
    id: a.id,
    label: a.name,
    description: formatMoney(a.priceCents)
  }));

  return (
    <main>
      {/* Increased bottom padding for mobile to account for the sticky PriceBar */}
      <Container className="pb-36 lg:pb-10 py-10">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {/* Left Column: Image */}
          <div className="md:sticky md:top-24 h-min">
            <ArtTile seed={flavorId} label={flavor.name} />
          </div>

          {/* Right Column: Configuration */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl">
                {flavor.name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Escolha sua massa e turbine com adicionais.
              </p>
            </div>

            {/* Massa Options */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Massa</h2>
              <OptionGrid
                options={CATALOG.masses.map((m) => ({ id: m.id, label: m.label }))}
                value={massa}
                onChange={(v) => setMassa(v as Massa)}
              />
               {!massa && <div className="text-sm text-red-400">A escolha da massa é obrigatória.</div>}
            </div>

            {/* Adicionais Options */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Adicionais</h2>
              <OptionGrid
                multiple
                options={addonOptions}
                value={addons}
                onChange={(v) => setAddons(v as VulcaoAddonId[])}
              />
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:block rounded-lg border bg-card/50 p-4 space-y-4">
               <div className="flex items-center justify-between gap-4">
                  <QtyControl value={qty} onChange={setQty} />
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {formatMoney(totalCents)}
                    </div>
                  </div>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!massa}
                >
                  Adicionar ao carrinho
                </Button>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Mobile Price Bar */}
      <PriceBar
        price={
           <div className="text-left">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-extrabold text-foreground">{formatMoney(totalCents)}</div>
          </div>
        }
        action={
            <Button onClick={handleAddToCart} disabled={!massa}>
              Adicionar
            </Button>
        }
      />
    </main>
  );
}
