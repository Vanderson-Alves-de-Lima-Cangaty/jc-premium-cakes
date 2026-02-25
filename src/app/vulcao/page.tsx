import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG } from "@/server/catalog";
import { formatMoney } from "@/lib/money";

export default function VulcaoPage() {
  const basePrice = CATALOG.vulcao.basePriceCents;

  return (
    <main>
      <Container className="py-12 md:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            Mini Bolos Vulcão
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
            Tamanho único, perfeito para um lanche especial. O preço base é{" "}
            <span className="font-semibold text-foreground">{formatMoney(basePrice)}</span>
            , com adicionais à sua escolha.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATALOG.vulcao.flavors.map((f) => (
            <ProductCard
              key={f.id}
              seed={f.id}
              title={f.name}
              price={basePrice}
              href={`/vulcao/${f.id}`}
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
