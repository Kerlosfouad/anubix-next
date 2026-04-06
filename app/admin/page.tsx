"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CATEGORIES = ["short", "long", "pants", "tanktop"];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  new:        { color: "text-blue-600",  bg: "bg-blue-50 border-blue-200",   label: "New" },
  processing: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Processing" },
  done:       { color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Done" },
  cancelled:  { color: "text-red-500",   bg: "bg-red-50 border-red-200",     label: "Cancelled" },
};

interface Order {
  id: string; created_at: string; customer_name: string;
  phone1: string; phone2?: string; governorate: string;
  address: string; payment_method: string;
  items: { title: string; size: string; quantity: number; price: string }[];
  shipping_cost: number; total: number; status: string;
}
interface Product {
  id: string; name: string; price: number;
  discount: number; image: string; category: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", discount: "0", image: "", category: "short" });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  function login() {
    if (pw === "anubix2024") setAuthed(true);
    else alert("Wrong password");
  }

  async function fetchOrders() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (data) setOrders(data);
  }
  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  useEffect(() => {
    if (!authed) return;
    fetchOrders(); fetchProducts();
    const ch = supabase.channel("orders-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authed]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setNewProduct(p => ({ ...p, image: json.url }));
    else alert("Upload failed");
    setUploading(false);
  }

  async function addProduct() {
    if (!newProduct.name || !newProduct.price || !newProduct.image) return alert("Fill all fields");
    setLoading(true);
    await supabase.from("products").insert({ name: newProduct.name, price: parseFloat(newProduct.price), discount: parseFloat(newProduct.discount) || 0, image: newProduct.image, category: newProduct.category });
    setNewProduct({ name: "", price: "", discount: "0", image: "", category: "short" });
    if (fileRef.current) fileRef.current.value = "";
    await fetchProducts(); setLoading(false);
  }

  async function updateDiscount(id: string, discount: number) {
    await supabase.from("products").update({ discount }).eq("id", id); fetchProducts();
  }
  async function deleteProduct(id: string) {
    if (!confirm("Delete?")) return;
    await supabase.from("products").delete().eq("id", id); fetchProducts();
  }
  async function updateOrderStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id); fetchOrders();
  }

  const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const newCount = orders.filter(o => o.status === "new").length;
  const doneCount = orders.filter(o => o.status === "done").length;
  const filtered = filterStatus === "all" ? orders : orders.filter(o => o.status === filterStatus);

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(0,0%,93%)" }}>
      <div className="bg-white rounded-3xl p-10 shadow-sm w-96 flex flex-col gap-5 text-center">
        <p className="font-smooch text-5xl">ANUBIX</p>
        <p className="text-xs text-gray-400 tracking-widest uppercase -mt-3">Admin Dashboard</p>
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()}
          className="input-field text-center tracking-widest mt-2" />
        <button onClick={login} className="bg-black text-white py-3 rounded-2xl font-semibold tracking-widest uppercase text-sm hover:bg-gray-900 transition-colors">Enter</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen pb-16 md:pb-0" style={{ background: "#f5f5f5" }}>
      <aside className="hidden md:flex w-60 bg-[#0a0a0a] text-white flex-col shrink-0">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="font-smooch text-3xl tracking-wide">ANUBIX</p>
          <p className="text-white/30 text-[10px] tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1 mt-2">
          {(["orders", "products"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${tab === t ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
              <i className={`text-base ${t === "orders" ? "ri-shopping-bag-3-line" : "ri-t-shirt-line"}`} />
              <span className="capitalize">{t}</span>
              {t === "orders" && newCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{newCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setAuthed(false)} className="text-white/30 text-xs hover:text-white transition-colors flex items-center gap-2">
            <i className="ri-logout-box-line" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Orders", value: orders.length,             icon: "ri-file-list-3-line",      accent: "#3b82f6" },
            { label: "New Orders",   value: newCount,                  icon: "ri-notification-3-line",   accent: "#f59e0b" },
            { label: "Completed",    value: doneCount,                 icon: "ri-checkbox-circle-line",  accent: "#10b981" },
            { label: "Revenue",      value: `${revenue.toFixed(0)} EGP`, icon: "ri-coins-line",          accent: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.accent + "18" }}>
                <i className={`${s.icon} text-xl`} style={{ color: s.accent }} />
              </div>
              <div>
                <p className="text-xs text-gray-400 tracking-wide">{s.label}</p>
                <p className="text-xl font-bold mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm tracking-widest uppercase">Orders</h2>
              <div className="flex gap-1.5">
                {["all","new","processing","done","cancelled"].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filterStatus === s ? "bg-black text-white" : "bg-white text-gray-400 hover:text-black shadow-sm"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {filtered.length === 0 && (
                <div className="text-center text-gray-300 py-24">
                  <i className="ri-inbox-2-line text-6xl block mb-3" />
                  <p className="text-sm tracking-widest uppercase">No orders</p>
                </div>
              )}
              {filtered.map(o => {
                const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.new;
                const isOpen = expandedOrder === o.id;
                return (
                  <div key={o.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className={`h-1 w-full ${o.status === "new" ? "bg-blue-400" : o.status === "processing" ? "bg-amber-400" : o.status === "done" ? "bg-green-400" : "bg-red-300"}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {o.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{o.customer_name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <i className="ri-phone-line text-gray-400 text-xs" />
                              <p className="text-xs text-gray-500">{o.phone1}{o.phone2 ? ` · ${o.phone2}` : ""}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <i className="ri-map-pin-line text-gray-400 text-xs" />
                              <p className="text-xs text-gray-500">{o.governorate} — {o.address}</p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <i className="ri-time-line text-gray-300 text-xs" />
                              <p className="text-xs text-gray-300">{new Date(o.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <p className="text-lg font-bold">{o.total} <span className="text-xs font-normal text-gray-400">EGP</span></p>
                          <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-semibold cursor-pointer ${sc.bg} ${sc.color}`}>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button onClick={() => setExpandedOrder(isOpen ? null : o.id)}
                        className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors">
                        <i className={`text-sm ${isOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`} />
                        {isOpen ? "Hide items" : `View ${o.items.length} item(s)`}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="border-t border-gray-50 bg-gray-50 px-5 py-4 flex flex-col gap-2">
                        {o.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-white rounded-xl px-4 py-3 shadow-sm">
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-sm">{item.price}</p>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs text-gray-400 px-1 mt-1">
                          <span>Shipping</span><span>{o.shipping_cost} EGP</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm px-1">
                          <span>Total</span><span>{o.total} EGP</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-sm tracking-widest uppercase">Products</h2>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="font-semibold text-sm tracking-widest uppercase mb-4">Add New Product</p>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="input-field" />
                <input placeholder="Price (EGP)" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="input-field" />
                <input placeholder="Discount %" type="number" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} className="input-field" />
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
              <label htmlFor="img-upload" className={`mt-3 flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-2xl py-5 cursor-pointer transition-colors text-sm ${newProduct.image ? "border-green-300 text-green-600 bg-green-50" : "border-gray-200 text-gray-400 hover:border-black"}`}>
                {uploading ? <><div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />Uploading...</> : newProduct.image ? <><i className="ri-checkbox-circle-line text-lg" />Image ready</> : <><i className="ri-upload-cloud-2-line text-lg" />Upload product image</>}
              </label>
              {newProduct.image && <img src={newProduct.image} className="mt-3 h-24 object-contain mx-auto rounded-xl" />}
              <button onClick={addProduct} disabled={loading || uploading} className="w-full mt-4 bg-black text-white py-3 rounded-2xl text-sm font-semibold tracking-widest uppercase disabled:opacity-40 hover:bg-gray-900 transition-colors">
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center border border-gray-100">
                  <img src={p.image} alt={p.name} className="w-16 h-16 object-contain rounded-xl bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold">{p.price} EGP</p>
                      {p.discount > 0 && <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full font-semibold">-{p.discount}%</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <div className="flex items-center gap-1">
                      <input type="number" min={0} max={100} defaultValue={p.discount}
                        onBlur={e => updateDiscount(p.id, parseFloat(e.target.value) || 0)}
                        className="w-14 border border-gray-200 rounded-xl px-2 py-1 text-xs text-center focus:outline-none focus:border-black" />
                      <span className="text-xs text-gray-400">%</span>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                      <i className="ri-delete-bin-line" />Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] text-white flex z-50">
        {(["orders", "products"] ).map(t => (
          <button key={t} onClick={() => setTab(t as "orders" | "products")}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-all ${tab === t ? "text-white" : "text-white/40"}`}>
            <i className={`text-xl ${t === "orders" ? "ri-shopping-bag-3-line" : "ri-t-shirt-line"}`} />
            <span className="capitalize text-[10px] tracking-wider">{t}</span>
            {t === "orders" && newCount > 0 && (
              <span className="absolute top-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{newCount}</span>
            )}
          </button>
        ))}
        <button onClick={() => setAuthed(false)} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-white/40">
          <i className="ri-logout-box-line text-xl" />
          <span className="text-[10px] tracking-wider">Logout</span>
        </button>
      </nav>
    </div>
  );
}
