"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { PackageX, Send, CheckCircle2, ShieldCheck, Clock, Undo2 } from "lucide-react";
import { Navbar } from "@/components/ui/layout/Navbar";
import { Footer } from "@/components/ui/layout/Footer";
import { Input } from "@/components/ui/primitives/Input";
import { Button } from "@/components/ui/primitives/Button";

const REASON_KEYS = [
  "reasonDefective",
  "reasonNotAsDescribed",
  "reasonWrongItem",
  "reasonChangedMind",
  "reasonSize",
  "reasonOther",
] as const;

const REASON_VALUES = ["defective", "not_as_described", "wrong_item", "changed_mind", "size", "other"];

export default function ResiPage() {
  const t = useTranslations("Resi");
  const [form, setForm] = useState({
    orderNumber: "",
    name: "",
    email: "",
    product: "",
    reason: "",
    details: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.orderNumber || !form.name || !form.email || !form.product || !form.reason) {
      toast.error(t("requiredToast"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errorToast"));
      }

      setSent(true);
      toast.success(t("successToast"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("errorToast"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 min-h-screen bg-text-primary">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-electric/10 border border-accent-electric/20 mb-5">
              <Undo2 size={24} className="text-accent-electric" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{t("title")}</h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <InfoCard icon={<Clock size={18} />} title={t("infoWindowTitle")} text={t("infoWindowText")} />
            <InfoCard icon={<ShieldCheck size={18} />} title={t("infoFreeTitle")} text={t("infoFreeText")} />
            <InfoCard icon={<PackageX size={18} />} title={t("infoPackagingTitle")} text={t("infoPackagingText")} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10"
          >
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">{t("successTitle")}</h2>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  {t("successText")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("nameLabel")}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <Input
                    label={t("emailLabel")}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("orderNumberLabel")}
                    placeholder={t("orderNumberPlaceholder")}
                    value={form.orderNumber}
                    onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                    required
                  />
                  <Input
                    label={t("productLabel")}
                    placeholder={t("productPlaceholder")}
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t("reasonLabel")}</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm [&>option]:bg-text-primary [&>option]:text-white"
                  >
                    <option value="">{t("reasonSelect")}</option>
                    {REASON_VALUES.map((value, i) => (
                      <option key={value} value={value}>{t(REASON_KEYS[i])}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">{t("detailsLabel")}</label>
                  <textarea
                    value={form.details}
                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                    className="w-full h-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none"
                    placeholder={t("detailsPlaceholder")}
                  />
                </div>

                <Button type="submit" size="xl" className="w-full" loading={loading} leftIcon={<Send size={18} />}>
                  {t("submit")}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
      <div className="text-accent-electric">{icon}</div>
      <p className="text-white text-sm font-medium">{title}</p>
      <p className="text-gray-500 text-xs">{text}</p>
    </div>
  );
}
