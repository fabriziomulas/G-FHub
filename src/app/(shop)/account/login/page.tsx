"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
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
      toast.success("Login effettuato!");
      router.push("/");
      router.refresh();
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary pt-24">
      <div className="glass p-8 rounded-2xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-text-primary text-center">Accedi</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" loading={loading} className="w-full">Accedi</Button>
        </form>
        <p className="text-text-muted text-sm text-center">
          Non hai un account?{" "}
          <Link href="/account/register" className="text-accent-electric hover:underline">Registrati</Link>
        </p>
      </div>
    </div>
  );
}