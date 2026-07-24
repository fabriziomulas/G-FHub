"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const statusParam = searchParams.get("status");
    const messageParam = searchParams.get("message");

    if (statusParam === "success") {
      setStatus("success");
      setMessage("Email verificata con successo! Ora puoi accedere.");
      setTimeout(() => {
        router.push("/account/login");
      }, 3000);
    } else if (statusParam === "error") {
      setStatus("error");
      setMessage(messageParam || "Errore durante la verifica.");
    } else {
      setStatus("error");
      setMessage("Parametri mancanti per la verifica.");
    }
  }, [searchParams, router, mounted]);

  // Durante SSR mostra un placeholder
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-4">
        <div className="max-w-md w-full bg-[#1A1A1A] rounded-2xl p-8 text-center border border-[#333]">
          <div className="w-16 h-16 border-4 border-[#B2B395] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-[#F4F5F6]">Verifica in corso...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C0A09] px-4">
      <div className="max-w-md w-full bg-[#1A1A1A] rounded-2xl p-8 text-center border border-[#333]">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-[#B2B395] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[#F4F5F6]">Verifica in corso...</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F4F5F6] mb-2">✅ Verifica completata!</h2>
            <p className="text-[#A0A0A0] mb-4">{message}</p>
            <p className="text-sm text-[#666]">Verrai reindirizzato al login tra pochi secondi...</p>
            <Link 
              href="/account/login" 
              className="mt-4 inline-block px-6 py-2 bg-[#B2B395] text-[#0C0A09] rounded-lg font-semibold hover:bg-[#9e9e83] transition"
            >
              Vai al Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#F4F5F6] mb-2">❌ Errore</h2>
            <p className="text-[#A0A0A0] mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/register" 
                className="px-6 py-2 bg-[#B2B395] text-[#0C0A09] rounded-lg font-semibold hover:bg-[#9e9e83] transition"
              >
                Registrati di nuovo
              </Link>
              <Link 
                href="/account/login" 
                className="text-[#B2B395] hover:underline text-sm"
              >
                Torna al Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}