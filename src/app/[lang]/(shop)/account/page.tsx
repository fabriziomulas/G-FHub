"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Badge } from "@/components/ui/primitives/Badge";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Copy, Gift } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { SITE_URL } from "@/lib/seo";
import { REFERRAL_MILESTONE_COUNT } from "@/lib/referral";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minSpent: number | null;
  used: boolean;
  expiresAt: string;
}

const DATE_LOCALES: Record<string, string> = {
  it: "it-IT",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

export default function AccountPage() {
  const t = useTranslations("Account");
  const locale = useLocale();
  const dateLocale = DATE_LOCALES[locale] || "it-IT";

  const [user, setUser] = useState<{
    email: string;
    name: string;
    level: string;
    xp: number;
    points: number;
    emailVerified: boolean;
  } | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [referral, setReferral] = useState<{ referralCode: string; referralsCount: number; rewardedCount: number } | null>(null);
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

    fetch("/api/user/referral")
      .then((r) => r.json())
      .then((data) => {
        if (data.referralCode) setReferral(data);
      });
  }, [router]);

  const referralLink = referral ? `${SITE_URL}?ref=${referral.referralCode}` : "";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(t("referralLinkCopied"));
  };

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

  const progress =
    nextLevel.minXp === 0
      ? 100
      : ((user.xp - currentLevel.minXp) /
          (nextLevel.minXp - currentLevel.minXp)) *
        100;

  const activeCoupons = coupons.filter(
    (c) => !c.used && new Date(c.expiresAt) > new Date()
  );

  const expiredCoupons = coupons.filter(
    (c) => !c.used && new Date(c.expiresAt) <= new Date()
  );

  const usedCoupons = coupons.filter((c) => c.used);

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen px-6 bg-text-primary">
        <div className="max-w-2xl mx-auto py-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("title")}
          </h1>

          <p className="text-gray-400 mb-4">{user.email}</p>

          {!user.emailVerified && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <p className="text-amber-400 text-sm font-medium">
                {t("emailNotVerified")}
              </p>

              <p className="text-amber-400/70 text-xs mt-1">
                {t("verifyHint")}
              </p>

              <button
                onClick={async () => {
                  await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                  });

                  toast.success(t("verifyEmailSent"));
                }}
                className="text-amber-400 text-xs underline mt-2 hover:text-amber-300"
              >
                {t("resendVerify")}
              </button>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                {t("level")}
              </h2>

              <LevelBadge level={user.level} size="md" />
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-linear-to-r from-accent-electric to-accent-purple rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>{user.xp} XP</span>
              <span>
                {nextLevel.name} - {nextLevel.minXp} XP
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
              <span>
                {t("loyaltyPoints")}{" "}
                <strong className="text-white">{user.points}</strong>
              </span>
            </div>
          </div>

          {referral && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={18} className="text-accent-electric" />
                <h2 className="text-lg font-semibold text-white">{t("referralTitle")}</h2>
              </div>

              <p className="text-gray-400 text-sm mb-4">{t("referralHint")}</p>

              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={referralLink}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs truncate"
                />
                <button
                  onClick={copyReferralLink}
                  className="p-2.5 rounded-lg bg-accent-electric text-white hover:bg-accent-purple transition-colors shrink-0"
                  aria-label={t("referralCopy")}
                >
                  <Copy size={16} />
                </button>
              </div>

              {referral.referralsCount > 0 && (
                <p className="text-gray-500 text-xs mt-3">
                  {t("referralStats", { count: referral.referralsCount, rewarded: referral.rewardedCount })}
                </p>
              )}

              {referral.rewardedCount < REFERRAL_MILESTONE_COUNT ? (
                <p className="text-accent-electric text-xs mt-1">
                  {t("referralMilestoneProgress", {
                    remaining: REFERRAL_MILESTONE_COUNT - referral.rewardedCount,
                  })}
                </p>
              ) : (
                <p className="text-accent-electric text-xs mt-1">{t("referralMilestoneReached")}</p>
              )}
            </div>
          )}

          {activeCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {t("activeCoupons", { count: activeCoupons.length })}
              </h2>

              <div className="space-y-3">
                {activeCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border border-green-500/30 bg-green-500/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-bold">{c.code}</p>

                      <p className="text-xs text-gray-400">
                        {t("expires")}{" "}
                        {new Date(c.expiresAt).toLocaleDateString(dateLocale)}
                        {c.minSpent && ` • ${t("minSpend", { amount: c.minSpent })}`}
                      </p>
                    </div>

                    <Badge color="success">
                      {t("discount", { percent: c.discount })}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiredCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {t("expiredCoupons", { count: expiredCoupons.length })}
              </h2>

              <div className="space-y-3">
                {expiredCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border border-red-500/30 bg-red-500/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-bold">{c.code}</p>

                      <p className="text-xs text-gray-400">
                        {t("expired")}{" "}
                        {new Date(c.expiresAt).toLocaleDateString(dateLocale)}
                        {c.minSpent && ` • ${t("minSpend", { amount: c.minSpent })}`}
                      </p>
                    </div>

                    <Badge color="error">
                      {t("discount", { percent: c.discount })}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {usedCoupons.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {t("usedCoupons", { count: usedCoupons.length })}
              </h2>

              <div className="space-y-3">
                {usedCoupons.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border border-red-500/30 bg-red-500/5 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-white font-bold">{c.code}</p>

                      <p className="text-xs text-gray-400">
                        {t("used")}{" "}
                        {new Date(c.expiresAt).toLocaleDateString(dateLocale)}
                        {c.minSpent && ` • ${t("minSpend", { amount: c.minSpent })}`}
                      </p>
                    </div>

                    <Badge color="error">
                      {t("discount", { percent: c.discount })}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCoupons.length === 0 &&
            expiredCoupons.length === 0 &&
            usedCoupons.length === 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {t("coupons")}
                </h2>

                <p className="text-gray-400 text-sm">
                  {t("noCoupons")}
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  {t("noCouponsHint")}
                </p>
              </div>
            )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">
              {t("orders")}
            </h2>

            <p className="text-gray-400 text-sm">
              {t("ordersComingSoon")}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
