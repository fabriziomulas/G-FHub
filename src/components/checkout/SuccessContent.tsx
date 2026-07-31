"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/primitives/Button";
import { CheckCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/orders/by-session/${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          trackEvent("purchase", {
            transaction_id: sessionId,
            value: data.total,
            currency: "EUR",
          });
        }
      })
      .catch(() => {});
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center glass p-12 rounded-2xl max-w-md">
        <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Pagamento riuscito!
        </h1>
        <p className="text-text-secondary mb-6">
          Grazie per il tuo ordine. Riceverai una email di conferma a breve.
        </p>
        <Link href="/shop">
          <Button variant="secondary">Continua lo shopping</Button>
        </Link>
      </div>
    </div>
  );
}
