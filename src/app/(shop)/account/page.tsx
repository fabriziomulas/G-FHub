"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Badge } from "@/components/ui/primitives/Badge";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { toast } from "sonner";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minSpent: number | null;
  used: boolean;
  expiresAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<{ email: string; name: string; level: string; xp: number; points: number; emailVerified: boolean } | null>(null);
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
  }, [router]);

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
  const expiredCoupons = coupons.filter((c) => !c.used && new Date(c.expiresAt) <= new Date());
  const usedCoupons = coupons.filter((c) => c.used);

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen px-6 bg-[#0C0A09]">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-white mb-2">Il mio account</h1>
          <p className="text-gray-400 mb-4">{user.email}</p>

          {!user.emailVerified && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-amber-400 text-sm font-medium">⚠️ Email non verificata</p>
              <p className="text-amber-400/70 text-xs mt-1">
                Controlla la tua casella di posta e clicca sul link di verifica.
              </p>
              <button
                onClick={async () => {
                  await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                  });
                  toast.success("Email di verifica inviata!");
                }}
                className="text-amber-400 text-xs underline mt-2 hover:text-amber-300"
              >
                Reinvia email di verifica
              </button>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Livello</h2>
              <LevelBadge level={user.level} size="md" />
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-linear-to-r from-accent-electric to-accent-purple rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{user.xp} XP</span>
              <span>{nextLevel.name} - {nextLevel.minXp} XP</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
              <span>Punti fedeltà: <strong className="text-white">{user.points}</strong></span>
            </div>
          </div>

          {activeCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Coupon attivi ({activeCoupons.length})</h2>
              <div className="space-y-3">
                {activeCoupons.map((c) => (
                  <div key={c.id} className="flex justify-between items-center border border-green-500/30 bg-green-500/5 rounded-lg p-3">
                    <div>
                      <p className="text-white font-bold">{c.code}</p>
                      <p className="text-xs text-gray-400">
                        Scade {new Date(c.expiresAt).toLocaleDateString("it-IT")}
                        {c.minSpent && ` • Minimo €${c.minSpent}`}
                      </p>
                    </div>
                    <Badge color="success">{c.discount}% sconto</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiredCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Coupon scaduti ({expiredCoupons.length})</h2>
              <div className="space-y-3">
                {expiredCoupons.map((c) => (
                  <div key={c.id} className="flex justify-between items-center border border-red-500/30 bg-red-500/5 rounded-lg p-3">
                    <div>
                      <p className="text-white font-bold">{c.code}</p>
                      <p className="text-xs text-gray-400">
                        Scaduto il {new Date(c.expiresAt).toLocaleDateString("it-IT")}
                        {c.minSpent && ` • Minimo €${c.minSpent}`}
                      </p>
                    </div>
                    <Badge color="error">{c.discount}% sconto</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {usedCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Coupon usati ({usedCoupons.length})</h2>
              <div className="space-y-3">
                {usedCoupons.map((c) => (
                  <div key={c.id} className="flex justify-between items-center border border-red-500/30 bg-red-500/5 rounded-lg p-3">
                    <div>
                      <p className="text-white font-bold">{c.code}</p>
                      <p className="text-xs text-gray-400">
                        Usato • Scadeva il {new Date(c.expiresAt).toLocaleDateString("it-IT")}
                        {c.minSpent && ` • Minimo €${c.minSpent}`}
                      </p>
                    </div>
                    <Badge color="error">{c.discount}% sconto</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCoupons.length === 0 && expiredCoupons.length === 0 && usedCoupons.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Coupon</h2>
              <p className="text-gray-400 text-sm">Non hai ancora coupon disponibili.</p>
              <p className="text-gray-400 text-sm mt-1">Continua a fare acquisti per guadagnare coupon esclusivi!</p>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">I miei ordini</h2>
            <p className="text-gray-400 text-sm">Storico ordini in arrivo...</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}