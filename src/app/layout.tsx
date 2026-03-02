import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Premiun cakes jc",
  description: "Peça mini bolos vulcão e bolo 10 pessoas com facilidade.",
  openGraph: {
    title: "Premiun cakes jc",
    description: "A confeitaria que adoça seus momentos. Escolha, personalize e peça pelo WhatsApp.",
    type: "website",
    locale: "pt_BR",
    siteName: "Premiun cakes jc",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
