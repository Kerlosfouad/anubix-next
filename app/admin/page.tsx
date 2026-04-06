"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["short", "long", "pants", "tanktop"];

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  phone1: string;
  phone2?: string;
  governorate: string;
  address: string;
  payment_method: string;
  items: { title: string; size: string; quantity: number; price: string }[];
  shipping_cost: number;
  total: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  category: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  phone1: string;
  phone2?: string;
  governorate: string;
  address: string;
  payment_method: string;
  items: { title: string; size: string; quantity: number; price: string }[];
  shipping_cost: number;
  total: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discount: number;
  image: string;
  category: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", discount: "0", image: "", category: "short" });
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
    fetchOrders();
    fetchProducts();
  }, [authed]);

  async function addProduct() {
    if (!newProduct.name || !newProduct.price || !newProduct.image) return alert("Fill all fields");
    setLoading(true);
    await supabase.from("products").insert({
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      discount: parseFloat(newProduct.discount) || 0,
      image: newProduct.image,
      category: newProduct.category,
    });
    setNewProduct({ name: "", price: "", discount: "0", image: "", category: "short" });
    await fetchProducts();
    setLoading(false);
  }

  async function updateDiscount(id: string, discount: number) {
    await supabase.from("products").update({ discount }).eq("id", id);
    await fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    await fetchProducts();
  }

  async function updateOrderStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    await fetchOrders();
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const newOrders = orders.filter((o) => o.status === "new").length;

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,93%)]">
        <div className="bg-white rounded-2xl p-8 shadow-sm w-80 flex flex-col gap-4">
          <h1 className="text-center font-semibold tracking-widest uppercase text-sm">Admin Login</h1>
          <input type="password" placeholder="Password" value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="input-field" />
          <button onClick={login} className="bg-black text-white py-2 rounded-xl font-semibold tracking-widest uppercase text-sm">
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,93%)] pb-10">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
        <span className="font-smooch text-2xl">ANUBIX Admin</span>
        <div className="flex gap-6 text-sm">
          <span>🛒 {newOrders} new orders</span>
          <span>💰 {totalRevenue.toFixed(0)} EGP</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-6 pt-6">
        {(["orders", "products"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all ${
              tab === t ? "bg-black text-white" : "bg-white text-gray-500 hover:text-black"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 mt-6">
        {/* ORDERS */}
        {tab === "orders" && (
          <div className="flex flex-col gap-3">
            {orders.length === 0 && <p className="text-center text-gray-400 mt-10">No orders yet</p>}
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{o.phone1} {o.phone2 && `· ${o.phone2}`}</p>
                    <p className="text-xs text-gray-400">{o.governorate} — {o.address}</p>
                    <p className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-bold text-sm">{o.total} EGP</span>
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border font-semibold ${
                        o.status === "new" ? "border-blue-300 text-blue-600" :
                        o.status === "done" ? "border-green-300 text-green-600" :
                        "border-gray-200 text-gray-500"
                      }`}>
                      <option value="new">New</option>
                      <option value="processing">Processing</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                  className="text-xs text-gray-400 mt-2 underline">
                  {expandedOrder === o.id ? "Hide items" : "Show items"}
                </button>
                {expandedOrder === o.id && (
                  <div className="mt-2 flex flex-col gap-1">
                    {o.items.map((item, i) => (
                      <div key={i} className="text-xs bg-gray-50 rounded-lg px-3 py-2 flex justify-between">
                        <span>{item.title} ({item.size}) × {item.quantity}</span>
                        <span>{item.price}</span>
                      </div>
                    ))}
                    <div className="text-xs text-gray-400 px-3">Shipping: {o.shipping_cost} EGP</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="flex flex-col gap-4">
            {/* Add product form */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm tracking-widest uppercase mb-3">Add Product</h3>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Name" value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="input-field" />
                <input placeholder="Price (EGP)" type="number" value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="input-field" />
                <input placeholder="Discount %" type="number" value={newProduct.discount}
                  onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                  className="input-field" />
                <select value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input placeholder="Image URL" value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                className="input-field mt-2" />
              <button onClick={addProduct} disabled={loading}
                className="w-full mt-3 bg-black text-white py-2 rounded-xl text-sm font-semibold tracking-widest uppercase disabled:opacity-50">
                {loading ? "Adding..." : "Add Product"}
              </button>
            </div>

            {/* Products list */}
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-14 h-14 object-contain rounded-lg bg-gray-50" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                  <p className="text-sm font-bold">{p.price} EGP
                    {p.discount > 0 && <span className="text-green-500 text-xs ml-2">-{p.discount}%</span>}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-1">
                    <input type="number" placeholder="%" defaultValue={p.discount}
                      onBlur={(e) => updateDiscount(p.id, parseFloat(e.target.value) || 0)}
                      className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center" />
                    <span className="text-xs text-gray-400">%off</span>
                  </div>
                  <button onClick={() => deleteProduct(p.id)}
                    className="text-red-400 text-xs hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
