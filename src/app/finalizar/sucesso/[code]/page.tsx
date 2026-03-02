"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const [waUrl, setWaUrl] = useState<string | null>(null);

  useEffect(() => {
    // Recuperamos a URL do WhatsApp salva no sessionStorage pela página de finalizar
    const savedUrl = sessionStorage.getItem(`wa_url_${params.code}`);
    if (savedUrl) setWaUrl(savedUrl);
  }, [params.code]);

  const handleOpenWhatsApp = () => {
    if (waUrl) window.location.href = waUrl;
  };

  return (
    <Container className="py-12 md:py-20">
      <Card className="mx-auto max-w-2xl overflow-hidden border-primary/20 shadow-xl">
        <div className="bg-primary/10 p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pedido foi Gerado!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Seu código é: <span className="font-bold text-primary">#{params.code}</span>
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="rounded-lg bg-card border p-4 text-sm space-y-3">
             <p className="font-semibold text-foreground">Próximo passo importante:</p>
             <p className="text-muted-foreground">
                Clique no botão abaixo para nos enviar os detalhes do seu pedido via WhatsApp.
                Somente após o envio da mensagem o seu pedido começará a ser preparado.
             </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button size="lg" className="h-16 text-lg gap-2" onClick={handleOpenWhatsApp}>
              <MessageCircle />
              Enviar para o WhatsApp
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft size={18} />
              Voltar para a Loja
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Atendimento: Finais de semana. Entraremos em contato para confirmar o pagamento.
          </p>
        </div>
      </Card>
    </Container>
  );
}
