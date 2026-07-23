"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { Badge } from "@/components/ui/primitives/Badge";
import { toast } from "sonner";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { email: string; name: string | null };
  items: Array<{
    quantity: number;
    price: number;
    product: { title: string; images: string[] };
  }>;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [orders, setOrders] = useState<Order[]>([]);
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

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    if (loggedIn) fetchOrders();
  }, [loggedIn, tab]);

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
          <Button className="w-full" onClick={handleLogin}>Accedi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary p-8">
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "products" ? "bg-accent-electric text-white" : "glass text-text-secondary"
            }`}
          >
            Prodotti
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "orders" ? "bg-accent-electric text-white" : "glass text-text-secondary"
            }`}
          >
            Ordini ({orders.length})
          </button>
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div className="glass p-8 rounded-2xl">
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
              <Button type="submit" loading={loading} className="w-full">Crea Prodotto</Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div className="glass p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Ordini</h1>
            {orders.length === 0 ? (
              <p className="text-text-muted">Nessun ordine ancora.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="glass p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-text-primary font-medium">
                          {order.user?.email || "Guest"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(order.createdAt).toLocaleDateString("it-IT", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge color={order.status === "PAID" ? "success" : "warning"}>
                          {order.status === "PAID" ? "Pagato" : order.status}
                        </Badge>
                        <p className="text-lg font-bold text-text-primary mt-1">€{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-xs text-text-secondary">
                          {item.quantity}x {item.product.title}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}