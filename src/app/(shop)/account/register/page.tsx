"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password minima 6 caratteri");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success("Registrazione completata! Accedi ora.");
      router.push("/account/login");
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary pt-24">
      <div className="glass p-8 rounded-2xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-text-primary text-center">Registrati</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password (min 6 caratteri)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Registrati</Button>
        </form>
        <p className="text-text-muted text-sm text-center">
          Hai già un account?{" "}
          <Link href="/account/login" className="text-accent-electric hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  );
}