import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { CATALOG } from "@/server/catalog";

// Helper component for feature highlights
const Feature = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card/50 p-4 text-center">
    <div className="font-bold text-foreground">{title}</div>
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
);

export default function HomePage() {
  return (
    <main className="text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_40%),radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <Container className="relative py-20 text-center sm:py-28">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl">
            Premiun cakes jc
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A confeitaria que adoça seus momentos. Escolha, personalize e peça
            em minutos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/vulcao">Ver Bolos Vulcão</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/bolo-10">Montar Bolo 10 Pessoas</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section>
        <Container className="py-16 md:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Nossos Carros-Chefes
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Duas opções deliciosas, feitas com carinho para você.
            </p>
          </div>
          <div className="mx-auto grid max-w-sm grid-cols-1 gap-8 md:max-w-4xl md:grid-cols-2">
            <ProductCard
              href="/vulcao"
              seed="cat-vulcao"
              title="Mini Bolo Vulcão"
              subtitle="Perfeito para uma pessoa, com cobertura cremosa que escorre como lava."
              price={CATALOG.vulcao.basePriceCents}
            />
            <ProductCard
              href="/bolo-10"
              seed="cat-bolo10"
              title="Bolo para 10 Pessoas"
              subtitle="Monte o bolo ideal para sua celebração, escolhendo cada detalhe."
              price={CATALOG.bolo10.basePriceCents}
            />
          </div>
        </Container>
      </section>
      
      {/* How it works Section */}
      <section className="border-t border-border bg-card/25">
         <Container className="py-16 md:py-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Como Funciona
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
                Pedir seu bolo nunca foi tão fácil.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Feature title="1. Escolha">Seu bolo favorito entre as opções do cardápio.</Feature>
                <Feature title="2. Personalize">Adicione seu toque especial com massas e adicionais.</Feature>
                <Feature title="3. Finalize">Gere um pedido no WhatsApp com tudo pronto.</Feature>
            </div>
         </Container>
      </section>
    </main>
  );
}
