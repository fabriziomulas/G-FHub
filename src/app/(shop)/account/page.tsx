"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Badge } from "@/components/ui/primitives/Badge";
import { Button } from "@/components/ui/primitives/Button";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string; name: string; level: string; xp: number; points: number } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/account/login");
        } else {
          setUser(data.user);
        }
      });
  }, []);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen px-6">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Il mio account</h1>
          <p className="text-text-secondary mb-8">{user.email}</p>

          <div className="glass p-6 rounded-2xl mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Livello</h2>
            <div className="flex items-center gap-3">
              <Badge color="electric">{user.level}</Badge>
              <span className="text-text-secondary text-sm">{user.xp} XP</span>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-text-primary mb-4">I miei ordini</h2>
            {orders.length === 0 ? (
              <p className="text-text-muted text-sm">Nessun ordine ancora.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between items-center border-b border-border-default pb-2">
                    <span className="text-text-primary text-sm">{new Date(o.createdAt).toLocaleDateString()}</span>
                    <Badge color={o.status === "PAID" ? "success" : "warning"}>{o.status}</Badge>
                    <span className="text-text-primary font-medium">€{o.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}