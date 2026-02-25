"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { OptionGrid } from "@/components/OptionGrid";
import { Button } from "@/components/ui/Button";
import {
  CATALOG,
  type Massa,
  type TopoType,
} from "@/server/catalog";
import { useCartStore } from "@/store/cart";
import { QtyControl } from "@/components/QtyControl";
import { formatMoney } from "@/lib/money";
import { ArtTile } from "@/components/ArtTile";
import { useToast } from "@/components/ToastProvider";
import { PriceBar } from "@/components/PriceBar";
import { Card } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

// Removed 'topo' from steps as per user request
type StepId = "massa" | "recheio" | "revisao";

const STEPS: { id: StepId; title: string }[] = [
  { id: "massa", title: "Massa" },
  { id: "recheio", title: "Recheio" },
  // { id: "topo", title: "Topo" }, // Removed
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
  // topoType is now always 'simples' if topo is selected, otherwise 'nenhum'
  const [topoType, setTopoType] = useState<TopoType>("simples"); // Default to 'simples' if no choice is given

  const [qty, setQty] = useState(1);
  
  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const totalCents = useMemo(() => {
    const base = CATALOG.bolo10.basePriceCents;
    // Topo price logic simplified: always apply 'simples' topo price if 'simples' is chosen
    // (or if it's the only option implicitly)
    const topoPrice = topoType === "simples" ? CATALOG.bolo10.topo.simples : 0;
    return (base + topoPrice) * qty;
  }, [topoType, qty]);

  const massaOptions = CATALOG.masses.map(m => ({ id: m.id, label: m.label }));
  const fillingOptions = CATALOG.bolo10.fillings.map(f => ({ id: f.id, label: f.name }));
  
  // No topoOptions directly displayed to the user for choice

  const handleNext = () => {
    if (step === "massa" && massa) setStep("recheio");
    else if (step === "recheio" && fillingId) setStep("revisao"); // Skip topo step
  };
  
  const handleBack = () => {
    if (step === "revisao") setStep("recheio"); // Back to recheio
    else if (step === "recheio") setStep("massa");
  }

  const handleAddToCart = () => {
    if (!massa || !fillingId) return;
    // If user doesn't explicitly choose 'nenhum' or 'simples' for topo, we default to 'simples' (basic topo is part of the offering)
    addItem({ kind: "bolo10", massa, fillingId, topoType: topoType, qty }); 
    toast.success("Adicionado ao carrinho!", "Bolo 10 pessoas");
    router.push("/carrinho");
  };
  
  const canGoNext = (step === 'massa' && !!massa) || (step === 'recheio' && !!fillingId); // No topo step to validate

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
            {/* Added instruction for inspiration photos */}
            <p className="text-sm text-muted-foreground">
                **Personalização:** Para que seu bolo fique perfeito, nos envie fotos ou prints da sua inspiração e do tema desejado via WhatsApp, após finalizar o pedido. Assim, faremos exatamente do jeito que você sonha!
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
                    <span className="text-muted-foreground">Topo:</span> 
                    <span className="font-semibold">
                      Com topo (a combinar no Zap)
                    </span>
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
                {/* Removed 'topo' selection step */}
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
                                <span className="text-muted-foreground">Topo:</span> 
                                <span className="font-semibold">
                                  Com topo (a combinar no Zap)
                                </span>
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
                disabled={step !== 'revisao' ? !canGoNext : (!massa || !fillingId)}
            >
                {step !== 'revisao' ? "Próximo" : "Adicionar"}
            </Button>
        }
      />
    </main>
  );
}
