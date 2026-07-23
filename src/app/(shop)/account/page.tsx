"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Badge } from "@/components/ui/primitives/Badge";
import { Button } from "@/components/ui/primitives/Button";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minSpent: number | null;
  used: boolean;
  expiresAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string; name: string; level: string; xp: number; points: number } | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
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
    fetch("/api/user/coupons")
      .then((r) => r.json())
      .then(setCoupons);
  }, []);

  if (!user) return null;

  const LEVELS = [
    { name: "STONE", minXp: 0 },
    { name: "BRONZE", minXp: 500 },
    { name: "SILVER", minXp: 1500 },
    { name: "GOLD", minXp: 4000 },
    { name: "PLATINUM", minXp: 8000 },
    { name: "DIAMOND", minXp: 18000 },
    { name: "MASTER", minXp: 35000 },
    { name: "LEGEND", minXp: 70000 },
  ];

  const currentLevel = LEVELS.find((l) => l.name === user.level) || LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.minXp > user.xp) || currentLevel;
  const progress = nextLevel.minXp === 0 ? 100 : ((user.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100;

  const activeCoupons = coupons.filter((c) => !c.used && new Date(c.expiresAt) > new Date());

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen px-6">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Il mio account</h1>
          <p className="text-text-secondary mb-8">{user.email}</p>

          {/* Livello + XP Bar */}
          <div className="glass p-6 rounded-2xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">Livello</h2>
              <Badge color="electric">{user.level}</Badge>
            </div>
            <div className="w-full h-3 bg-background-secondary rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-accent-electric to-accent-purple rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>{user.xp} XP</span>
              <span>{nextLevel.name} - {nextLevel.minXp} XP</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
              <span>Punti fedeltà: <strong className="text-text-primary">{user.points}</strong></span>
            </div>
          </div>

          {/* Coupon attivi */}
          {activeCoupons.length > 0 && (
            <div className="glass p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Coupon attivi</h2>
              <div className="space-y-3">
                {activeCoupons.map((c) => (
                  <div key={c.id} className="flex justify-between items-center border border-border-default rounded-lg p-3">
                    <div>
                      <p className="text-text-primary font-bold">{c.code}</p>
                      <p className="text-xs text-text-muted">
                        Scade {new Date(c.expiresAt).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <Badge color="success">-€{c.discount}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* I miei ordini */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-text-primary mb-4">I miei ordini</h2>
            <p className="text-text-muted text-sm">Storico ordini in arrivo...</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}