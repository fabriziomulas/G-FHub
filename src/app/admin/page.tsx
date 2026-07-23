"use client";

import { useState } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { toast } from "sonner";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({
    title: "",
    handle: "",
    description: "",
    price: "",
    compareAtPrice: "",
    images: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (password === "storeluxe2026") {
      setLoggedIn(true);
      toast.success("Accesso admin riuscito");
    } else {
      toast.error("Password errata");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
          images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        toast.success("Prodotto creato!");
        setForm({ title: "", handle: "", description: "", price: "", compareAtPrice: "", images: "", category: "" });
      } else {
        toast.error("Errore creazione prodotto");
      }
    } catch {
      toast.error("Errore");
    }
    setLoading(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="glass p-8 rounded-2xl w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold text-text-primary">Admin Login</h1>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <Button className="w-full" onClick={handleLogin}>
            Accedi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-2xl mx-auto glass p-8 rounded-2xl">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Aggiungi Prodotto</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titolo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Handle (URL)" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Descrizione</label>
            <textarea
              className="w-full h-24 px-3 py-2 rounded-lg bg-background-secondary border border-border-default text-text-primary text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prezzo (€)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <Input label="Prezzo originale (€)" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
          </div>
          <Input label="Immagini (URL separate da virgola)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
          <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Button type="submit" loading={loading} className="w-full">
            Crea Prodotto
          </Button>
        </form>
      </div>
    </div>
  );
}