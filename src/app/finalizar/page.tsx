"use client";

import { Container } from "@/components/Container";
import { OptionGrid } from "@/components/OptionGrid";
import { PriceBar } from "@/components/PriceBar";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatMoney } from "@/lib/money";
import { describeItem, lineTotalCents } from "@/server/pricing";
import { orderRequestSchema } from "@/server/validation";
import { useCartStore } from "@/store/cart";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DeliveryMethod = "retirada" | "entrega";
type PaymentMethod = "pix" | "dinheiro" | "cartao";

// A small component to display a label and its content
const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-foreground">{label}</label>
    {children}
  </div>
);

export default function FinalizarPage() {
  const router = useRouter();
  const { items, clear, subtotalCents } = useCartStore();
  const subtotal = subtotalCents();
  const toast = useToast();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("entrega");
  const [address, setAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(() => {
    if (!isMounted || !items.length) return true;
    if (deliveryMethod === "entrega" && address.trim().length < 8) return true;
    return false;
  }, [isMounted, items.length, deliveryMethod, address]);

  async function handleFinish() {
    setError(null);
    setLoading(true);
    try {
      const normalizedCustomerName = customerName.trim();
      const normalizedAddress = address.trim();

      const payload = {
        items,
        customerName: normalizedCustomerName.length >= 2 ? normalizedCustomerName : undefined,
        deliveryMethod,
        address: deliveryMethod === "entrega" && normalizedAddress ? normalizedAddress : undefined,
        paymentMethod
      };

      const preflight = orderRequestSchema.safeParse(payload);
      if (!preflight.success) {
        const issue = preflight.error.issues[0];
        throw new Error(issue?.message ?? "Dados inválidos. Revise seu pedido antes de continuar.");
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erro desconhecido ao finalizar o pedido.");

      clear();
      toast.success("Pedido gerado! Abrindo WhatsApp...");
      window.location.href = data.waUrl;

    } catch (e: any) {
      const msg = e.message ?? "Erro";
      setError(msg);
      toast.error("Falha ao finalizar", msg);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) return <Container className="py-10"><Card className="p-10 text-center"><h2 className="text-xl font-bold">Carregando...</h2></Card></Container>;

  if (items.length === 0) {
     return <Container className="py-10"><Card className="p-10 text-center"><h2 className="text-xl font-bold">Seu carrinho está vazio.</h2><Button className="mt-4" onClick={() => router.push("/")}>Ver produtos</Button></Card></Container>;
  }

  return (
    <main>
      {/* Increased bottom padding for mobile to account for the sticky PriceBar */}
      <Container className="pb-36 lg:pb-10 py-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Form Section */}
          <div className="space-y-8 lg:col-span-2">
            <h1 className="text-3xl font-extrabold tracking-tighter">Quase lá!</h1>

            <Card>
              <CardContent className="p-6 space-y-6">
                 <FormRow label="Seu nome (opcional)">
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Como podemos te chamar?" />
                 </FormRow>
                 <FormRow label="Entrega ou Retirada?">
                    <OptionGrid value={deliveryMethod} onChange={setDeliveryMethod} options={[
                        {id: 'entrega', label: 'Entrega', description: 'Receba em casa'},
                        {id: 'retirada', label: 'Retirada', description: 'Busque no local'}
                    ]}/>
                 </FormRow>
                 {deliveryMethod === 'entrega' && (
                    <FormRow label="Endereço para entrega">
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Santa Luzia, Av.Miguel Hatzinakis, 2384" />
                    </FormRow>
                 )}
                 <FormRow label="Forma de pagamento">
                    <OptionGrid value={paymentMethod} onChange={setPaymentMethod} options={[
                        {id: 'pix', label: 'PIX'},
                        {id: 'dinheiro', label: 'Dinheiro'},
                        {id: 'cartao', label: 'Cartão'}
                    ]}/>
                 </FormRow>
              </CardContent>
            </Card>

            {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                    <p className="font-bold">Ocorreu um erro:</p>
                    <p>{error}</p>
                </div>
            )}
          </div>

          {/* Desktop Summary */}
          <div className="hidden lg:block">
            <Card className="sticky top-24 p-6">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 border-b border-border pb-4 mb-4">
                {items.map((item, idx) => {
                    const d = describeItem(item);
                    return (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{d.title} x{item.qty}</span>
                            <span className="font-medium text-foreground">{formatMoney(lineTotalCents(item))}</span>
                        </div>
                    )
                })}
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
               <Button size="lg" className="mt-6 w-full" onClick={handleFinish} disabled={isDisabled || loading}>
                 {loading ? <Loader2 className="animate-spin" /> : "Gerar Pedido no WhatsApp"}
               </Button>
            </Card>
          </div>
        </div>
      </Container>

      {/* Mobile Price Bar */}
      <PriceBar
        price={
           <div className="text-left">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-extrabold text-foreground">{formatMoney(subtotal)}</div>
          </div>
        }
        action={
            <Button onClick={handleFinish} disabled={isDisabled || loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Gerar Pedido"}
            </Button>
        }
      />
    </main>
  );
}
