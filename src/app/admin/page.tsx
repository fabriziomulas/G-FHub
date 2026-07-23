"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { Badge } from "@/components/ui/primitives/Badge";
import { toast } from "sonner";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: { email: string; name: string | null } | null;
  items: Array<{
    quantity: number;
    price: number;
    product: { title: string; images: string[] };
  }>;
}

export default function AdminPage() {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [checking, setChecking] = useState(true);
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
    isNew: false,
    isBestSeller: false,
    isOnSale: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setChecking(false);
        if (!data.user || data.user.role !== "ADMIN") {
          router.push("/");
        }
      });
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetch("/api/admin/orders")
        .then((res) => res.json())
        .then(setOrders);
    }
  }, [user, tab]);

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
        setForm({ title: "", handle: "", description: "", price: "", compareAtPrice: "", images: "", category: "", isNew: false, isBestSeller: false, isOnSale: false });
      } else {
        toast.error("Errore creazione prodotto");
      }
    } catch {
      toast.error("Errore");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = form.images ? form.images.split(",").filter(Boolean) : [];
    for (const file of Array.from(files)) {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.url) urls.push(json.url);
    }
    setForm({ ...form, images: urls.join(",") });
    setUploading(false);
    toast.success("Immagini caricate!");
  };

  if (checking) {
    return <div className="min-h-screen bg-background-primary flex items-center justify-center"><p className="text-text-muted">Caricamento...</p></div>;
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-primary p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "products" ? "bg-accent-electric text-white" : "glass text-text-secondary"}`}>
            Prodotti
          </button>
          <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "orders" ? "bg-accent-electric text-white" : "glass text-text-secondary"}`}>
            Ordini ({orders.length})
          </button>
        </div>

        {tab === "products" && (
          <div className="glass p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-text-primary mb-6">Aggiungi Prodotto</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Titolo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Handle (URL)" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} required />
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Descrizione</label>
                <textarea className="w-full h-24 px-3 py-2 rounded-lg bg-background-secondary border border-border-default text-text-primary text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prezzo (€)" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <Input label="Prezzo originale (€)" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Immagini</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-accent-electric file:text-white hover:file:bg-accent-purple file:transition-colors file:cursor-pointer"
                />
                {uploading && <p className="text-xs text-text-muted mt-1">Caricamento in corso...</p>}
                {form.images && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.images.split(",").filter(Boolean).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </div>
              <Input label="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> Nuovi Arrivi
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} /> Best Seller
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.isOnSale} onChange={(e) => setForm({ ...form, isOnSale: e.target.checked })} /> Offerte
                </label>
              </div>
              <Button type="submit" loading={loading} className="w-full">Crea Prodotto</Button>
            </form>
          </div>
        )}

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
                        <p className="text-sm text-text-primary font-medium">{order.user?.email || "Guest"}</p>
                        <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="text-right">
                        <Badge color={order.status === "PAID" ? "success" : "warning"}>{order.status === "PAID" ? "Pagato" : order.status}</Badge>
                        <p className="text-lg font-bold text-text-primary mt-1">€{order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-xs text-text-secondary">{item.quantity}x {item.product.title}</span>
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