"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { REFERRAL_WELCOME_DISCOUNT } from "@/lib/referral";

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name,
        ref,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (data.success) {
      toast.success(t("registerSuccess"));
      router.push("/account/login");
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-text-primary pt-24 px-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-white text-center">
          {t("registerTitle")}
        </h1>

        {ref && (
          <p className="text-center text-accent-electric text-xs bg-accent-electric/10 border border-accent-electric/20 rounded-lg py-2 px-3">
            {t("referralWelcome", { percent: REFERRAL_WELCOME_DISCOUNT })}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label={t("nameLabel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label={t("emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={t("passwordHintLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {t("registerButton")}
          </Button>
        </form>

        <p className="text-gray-400 text-sm text-center">
          {t("hasAccount")}{" "}
          <Link
            href="/account/login"
            className="text-accent-electric hover:underline"
          >
            {t("loginButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}
