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
  }, [router]);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice
            ? parseFloat(form.compareAtPrice)
            : null,
          images: form.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        toast.success("Prodotto creato!");

        setForm({
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
      } else {
        toast.error("Errore creazione prodotto");
      }
    } catch {
      toast.error("Errore");
    }

    setLoading(false);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);

    const urls: string[] = form.images
      ? form.images.split(",").filter(Boolean)
      : [];

    for (const file of Array.from(files)) {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (json.url) {
        urls.push(json.url);
      }
    }

    setForm({
      ...form,
      images: urls.join(","),
    });

    setUploading(false);

    toast.success("Immagini caricate!");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-text-primary flex items-center justify-center">
        <p className="text-gray-400">
          Caricamento...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-text-primary p-8 pt-24">
      <div className="max-w-4xl mx-auto">

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "products"
                ? "bg-accent-electric text-white"
                : "bg-white/5 text-gray-400 border border-white/10"
            }`}
          >
            Prodotti
          </button>

          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "orders"
                ? "bg-accent-electric text-white"
                : "bg-white/5 text-gray-400 border border-white/10"
            }`}
          >
            Ordini ({orders.length})
          </button>
        </div>

        {tab === "products" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">
              Aggiungi Prodotto
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Titolo"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                required
              />

              <Input
                label="Handle (URL)"
                value={form.handle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    handle: e.target.value,
                  })
                }
                required
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Crea Prodotto
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}