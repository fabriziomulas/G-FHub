"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    setLoading(false);

    if (data.success) {
      toast.success(t("loginSuccess"));
      router.push("/");
      router.refresh();
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-text-primary pt-24 px-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-white text-center">
          {t("loginTitle")}
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label={t("emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label={t("passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            {t("loginButton")}
          </Button>
        </form>

        <p className="text-gray-400 text-sm text-center">
          {t("noAccount")}{" "}
          <Link
            href="/account/register"
            className="text-accent-electric hover:underline"
          >
            {t("registerButton")}
          </Link>
        </p>
      </div>
    </div>
  );
}
