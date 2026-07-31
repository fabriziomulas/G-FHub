"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/primitives/Button";
import { Input } from "@/components/ui/primitives/Input";
import { Badge } from "@/components/ui/primitives/Badge";
import { toast } from "sonner";
import { Printer, Package, MapPin, User, Mail, ArrowLeft, Trash2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { title: string; images: string[] };
}

interface Order {
  id: string;
  status: string;
  total: number;
  customerName: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminPage() {
  const [user, setUser] = useState<{ role: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    images: "",
    badge: "" as "" | "new" | "bestseller" | "sale",
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
        if (!data.user || data.user.role !== "ADMIN") router.push("/");
      });
  }, [router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetch("/api/admin/orders").then(r => r.json()).then(setOrders);
      fetch("/api/admin/products").then(r => r.json()).then(setProducts);
    }
  }, [user, tab]);

  const deleteProduct = async (id: string) => {
    if (!confirm("Eliminare questo prodotto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Prodotto eliminato");
      setProducts(products.filter(p => p.id !== id));
    } else {
      toast.error("Errore");
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
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          stock: form.stock,
          images: form.images.split(",").map(s => s.trim()).filter(Boolean),
          isNew: form.badge === "new",
          isBestSeller: form.badge === "bestseller",
          isOnSale: form.badge === "sale",
        }),
      });
      if (res.ok) {
        toast.success("Prodotto creato!");
        setForm({ title: "", description: "", price: "", stock: "", images: "", badge: "" });
        fetch("/api/admin/products").then(r => r.json()).then(setProducts);
      } else toast.error("Errore creazione prodotto");
    } catch { toast.error("Errore"); }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = form.images ? form.images.split(",").filter(Boolean) : [];
    for (const file of Array.from(files)) {
      const data = new FormData(); data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.url) urls.push(json.url);
    }
    setForm({ ...form, images: urls.join(",") });
    setUploading(false);
    toast.success("Immagini caricate!");
  };

  const printLabel = (order: Order) => {
    const label = `<html><head><title>Etichetta ${order.id.slice(0,8)}</title></head><body style="font-family:Arial;padding:20px"><h2>Storeluxe - Etichetta</h2><p>Ordine: ${order.id.slice(0,8)}</p><hr/><h3>Destinatario:</h3><p><strong>${order.customerName||"N/D"}</strong></p><p>${order.customerAddress||""}</p><p>${order.customerEmail||""}</p><hr/><h3>Prodotti:</h3>${order.items.map(i=>`<p>${i.quantity}x ${i.product.title}</p>`).join("")}</body></html>`;
    const win = window.open("","_blank","width=600,height=800");
    win?.document.write(label); win?.document.close();
  };

  if (checking) return <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center"><p className="text-gray-400">Caricamento...</p></div>;
  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#0C0A09] p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm"><ArrowLeft size={16} /> Torna al sito</Link>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==="products"?"bg-accent-electric text-white":"bg-white/5 text-gray-400 border border-white/10"}`}>Prodotti</button>
          <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab==="orders"?"bg-accent-electric text-white":"bg-white/5 text-gray-400 border border-white/10"}`}>Ordini ({orders.length})</button>
        </div>

        {tab === "products" && (
          <>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl mb-8">
              <h1 className="text-2xl font-bold text-white mb-6">Aggiungi Prodotto</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Titolo" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Descrizione</label><textarea className="w-full h-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Prezzo (€)" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  <Input label="Quantità disponibile" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Immagini</label>
                  <input type="file" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-accent-electric file:text-white hover:file:bg-accent-purple file:transition-colors file:cursor-pointer" />
                  {uploading && <p className="text-xs text-gray-500 mt-1">Caricamento in corso...</p>}
                  {form.images && <div className="flex gap-2 mt-2 flex-wrap">{form.images.split(",").filter(Boolean).map((url,i) => <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />)}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoria</label>
                  <select value={form.badge} onChange={e => setForm({...form, badge: e.target.value as ""|"new"|"bestseller"|"sale"})} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm [&>option]:bg-[#0C0A09] [&>option]:text-white">
                    <option value="">Nessuna</option><option value="new">Nuovi Arrivi</option><option value="bestseller">Best Seller</option><option value="sale">Offerte</option>
                  </select>
                </div>
                <Button type="submit" loading={loading} className="w-full">Crea Prodotto</Button>
              </form>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Prodotti ({products.length})</h2>
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-lg">
                    <div>
                      <span className="text-white text-sm font-medium">{p.title}</span>
                      <span className="text-gray-400 text-xs ml-3">€{p.price.toFixed(2)} - Stock: {p.stock}</span>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-400 p-1"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "orders" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
            <h1 className="text-2xl font-bold text-white mb-6">Ordini</h1>
            {orders.length === 0 ? <p className="text-gray-400">Nessun ordine ancora.</p> : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1"><span className="text-xs text-gray-500">#{order.id.slice(0,8)}</span><Badge color={order.status==="PAID"?"success":"warning"}>{order.status==="PAID"?"Pagato":order.status}</Badge></div>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("it-IT",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                      </div>
                      <p className="text-xl font-bold text-white">€{order.total.toFixed(2)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-300"><User size={14} className="text-gray-500"/><span>{order.customerName||"N/D"}</span></div>
                      <div className="flex items-center gap-1.5 text-gray-300"><Mail size={14} className="text-gray-500"/><span className="truncate">{order.customerEmail||"N/D"}</span></div>
                      <div className="flex items-center gap-1.5 text-gray-300 col-span-2"><MapPin size={14} className="text-gray-500"/><span>{order.customerAddress||"Indirizzo non disponibile"}</span></div>
                    </div>
                    <div className="border-t border-white/10 pt-3"><div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2"><Package size={14}/>Prodotti acquistati:</div><div className="flex flex-wrap gap-2">{order.items.map((item,i)=><span key={i} className="text-xs bg-white/10 text-white px-2 py-1 rounded-lg">{item.quantity}x {item.product.title}</span>)}</div></div>
                    <div className="border-t border-white/10 pt-3"><Button variant="secondary" size="sm" onClick={()=>printLabel(order)} leftIcon={<Printer size={14}/>}>Stampa etichetta</Button></div>
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