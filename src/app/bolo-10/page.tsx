"use client";

import { ArtTile } from "@/components/ArtTile";
import { Container } from "@/components/Container";
import { OptionGrid } from "@/components/OptionGrid";
import { PriceBar } from "@/components/PriceBar";
import { QtyControl } from "@/components/QtyControl";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/money";
import {
  CATALOG,
  type CoberturaBolo10Id,
  type Massa,
} from "@/shared/catalog";
import { useCartStore } from "@/store/cart";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

type StepId = "massa" | "recheio" | "cobertura" | "revisao"; // Added 'cobertura'

const STEPS: { id: StepId; title: string }[] = [
  { id: "massa", title: "Massa" },
  { id: "recheio", title: "Recheio" },
  { id: "cobertura", title: "Cobertura" }, // Added 'Cobertura' step
  { id: "revisao", title: "Revisão" },
];

const Progress = ({
  current,
  onSet,
}: {
  current: StepId;
  onSet: (step: StepId) => void;
}) => {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => onSet(step.id)}
            disabled={index > currentIndex}
            className="flex flex-col items-center gap-2 disabled:opacity-50"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${
                index <= currentIndex ? "border-primary bg-primary/20 text-foreground" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {index < currentIndex ? <CheckCircle2 size={16} /> : index + 1}
            </div>
            <div className="text-xs font-semibold text-muted-foreground">{step.title}</div>
          </button>
          {index < STEPS.length - 1 && (
            <div className="h-0.5 w-full flex-1 bg-border" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function Bolo10Page() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();

  const [step, setStep] = useState<StepId>("massa");
  const [massa, setMassa] = useState<Massa | null>(null);
  const [fillingId, setFillingId] = useState<(typeof CATALOG.bolo10.fillings)[number]["id"] | null>(null);
  const [coberturaId, setCoberturaId] = useState<CoberturaBolo10Id | null>(null); // New state for cobertura

  const [qty, setQty] = useState(1);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const totalCents = useMemo(() => {
    const base = CATALOG.bolo10.basePriceCents;
    const coberturaPrice = coberturaId ? CATALOG.bolo10.coberturas.find(c => c.id === coberturaId)?.priceCents ?? 0 : 0;
    return (base + coberturaPrice) * qty;
  }, [coberturaId, qty]); // Updated dependencies

  const massaOptions = CATALOG.masses.map(m => ({ id: m.id, label: m.label }));
  const fillingOptions = CATALOG.bolo10.fillings.map(f => ({ id: f.id, label: f.name }));
  const coberturaOptions = CATALOG.bolo10.coberturas.map(c => ({ id: c.id, label: c.name })); // New options

  const handleNext = () => {
    if (step === "massa" && massa) setStep("recheio");
    else if (step === "recheio" && fillingId) setStep("cobertura"); // Go to cobertura step
    else if (step === "cobertura" && coberturaId) setStep("revisao"); // Go to revisao step
  };

  const handleBack = () => {
    if (step === "revisao") setStep("cobertura"); // Back to cobertura
    else if (step === "cobertura") setStep("recheio"); // Back to recheio
    else if (step === "recheio") setStep("massa");
  }

  const handleAddToCart = () => {
    if (!massa || !fillingId || !coberturaId) return; // Validate cobertura
    addItem({ kind: "bolo10", massa, fillingId, coberturaId, qty }); // Pass coberturaId
    toast.success("Adicionado ao carrinho!", "Bolo 10 pessoas");
    router.push("/carrinho");
  };

  const canGoNext =
      (step === 'massa' && !!massa) ||
      (step === 'recheio' && !!fillingId) ||
      (step === 'cobertura' && !!coberturaId); // Validate cobertura step

  return (
    <main>
      {/* Increased bottom padding for mobile to account for the sticky PriceBar */}
      <Container className="pb-36 lg:pb-10 py-10">
        <div className="grid gap-10 md:grid-cols-[2fr,3fr] md:gap-12">
          {/* Left Column: Summary */}
          <div className="md:sticky md:top-24 h-min space-y-6">
            <ArtTile seed={`bolo-10-${massa ?? 'base'}`} label="Bolo 10" />
            <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl">Bolo 10 pessoas</h1>
            <p className="text-muted-foreground">Monte seu bolo passo a passo. </p>
            {/* Added instruction for inspiration photos and explicit topper info */}
            <p className="text-sm text-muted-foreground">
                **Personalização do Bolo e Topper:** Para que seu bolo fique perfeito, nos envie fotos ou prints da sua inspiração para o bolo e o tema desejado para o topo de bolo via WhatsApp, após finalizar o pedido. Assim, faremos exatamente do jeito que você deseja!
            </p>
            <Card className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Massa:</span>
                    <span className="font-semibold">{massa ? massaOptions.find(m => m.id === massa)?.label : '...'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Recheio:</span>
                    <span className="font-semibold">{fillingId ? fillingOptions.find(f => f.id === fillingId)?.label : '...'}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Cobertura:</span>
                    <span className="font-semibold">{coberturaId ? coberturaOptions.find(c => c.id === coberturaId)?.label : '...'}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Topo de bolo:</span>
                    <span className="font-semibold">A combinar via WhatsApp (opicional)</span>
                </div>
            </Card>
             <div className="hidden md:block">
                <div className="text-right mt-4">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-3xl font-extrabold text-foreground">{formatMoney(totalCents)}</div>
                </div>
             </div>
          </div>

          {/* Right Column: Steps */}
          <div className="space-y-8">
            <Progress current={step} onSet={(s) => {
                const targetIndex = STEPS.findIndex(st => st.id === s);
                if(targetIndex < currentStepIndex) setStep(s);
                // The `canGoNext` logic already handles validation for stepping forward
                else if(targetIndex === (currentStepIndex + 1) && canGoNext) handleNext();
            }} />

            <div className="min-h-[300px]">
                {step === 'massa' && <OptionGrid options={massaOptions} value={massa} onChange={setMassa} />}
                {step === 'recheio' && <OptionGrid options={fillingOptions} value={fillingId} onChange={setFillingId} />}
                {step === 'cobertura' && <OptionGrid options={coberturaOptions} value={coberturaId} onChange={setCoberturaId} />} {/* New Cobertura step */}
                {step === 'revisao' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Quase lá!</h2>
                        <p className="text-muted-foreground">Confira os detalhes e a quantidade antes de adicionar ao carrinho.</p>
                         <Card className="p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Massa:</span>
                                <span className="font-semibold">{massa ? massaOptions.find(m => m.id === massa)?.label : '...'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Recheio:</span>
                                <span className="font-semibold">{fillingId ? fillingOptions.find(f => f.id === fillingId)?.label : '...'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cobertura:</span>
                                <span className="font-semibold">{coberturaId ? coberturaOptions.find(c => c.id === coberturaId)?.label : '...'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Topo de bolo:</span>
                                <span className="font-semibold">A combinar via WhatsApp (opicional)</span>
                            </div>
                        </Card>
                        <QtyControl value={qty} onChange={setQty} />
                    </div>
                )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between">
              <Button variant="outline" onClick={handleBack} disabled={step === 'massa'}>Voltar</Button>
              {step !== 'revisao' ? (
                <Button onClick={handleNext} disabled={!canGoNext}>Próximo</Button>
              ) : (
                <Button size="lg" onClick={handleAddToCart}>Adicionar ao Carrinho</Button>
              )}
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
            <Button
                onClick={step !== 'revisao' ? handleNext : handleAddToCart}
                disabled={step !== 'revisao' ? !canGoNext : (!massa || !fillingId || !coberturaId)} // Updated disabled prop
            >
                {step !== 'revisao' ? "Próximo" : "Adicionar"}
            </Button>
        }
      />
    </main>
  );
}
