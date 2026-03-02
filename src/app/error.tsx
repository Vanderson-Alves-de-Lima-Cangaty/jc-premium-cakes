"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/Container";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Ops! Algo deu errado
      </h1>
      <p className="mt-2 text-muted-foreground">
        Não conseguimos carregar esta página. Pode ser um erro temporário no servidor.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={() => reset()} size="lg">
          Tentar novamente
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/"} size="lg">
          Voltar para o Início
        </Button>
      </div>
    </Container>
  );
}
