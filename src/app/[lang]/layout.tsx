import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import "../globals.css";
import { Providers } from "../providers";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/ui/global/SmoothScroll";
import { Analytics } from "@/components/analytics/Analytics";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { routing } from "@/i18n/routing";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "G&F Hub - Premium E-Commerce",
  description: "Esperienza di shopping premium, futuristica ed elegante.",
};

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(routing.locales, lang)) {
    notFound();
  }

  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background-primary text-text-primary">
        <NextIntlClientProvider>
          <Analytics />
          <Providers>
            <SmoothScroll />
            {children}
            <ChatWidget />
          </Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(12,10,9,0.95)",
                color: "#F4F5F6",
                border: "1px solid rgba(178,179,149,0.3)",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
