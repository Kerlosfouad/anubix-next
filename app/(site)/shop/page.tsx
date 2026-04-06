"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";

import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const GOVERNORATES = [
  { label: "القاهرة", value: 50 },
  { label: "الجيزة", value: 80 },
  { label: "الإسكندرية", value: 55 },
  { label: "الدقهلية", value: 80 },
  { label: "البحر الأحمر", value: 80 },
  { label: "البحيرة", value: 60 },
  { label: "الفيوم", value: 80 },
  { label: "الغربية", value: 80 },
  { label: "الإسماعيلية", value: 80 },
  { label: "المنوفية", value: 80 },
  { label: "المنيا", value: 80 },
  { label: "القليوبية", value: 80 },
  { label: "الوادي الجديد", value: 80 },
  { label: "السويس", value: 80 },
  { label: "أسوان", value: 80 },
  { label: "أسيوط", value: 80 },
  { label: "بني سويف", value: 80 },
  { label: "بورسعيد", value: 80 },
  { label: "دمياط", value: 80 },
  { label: "الشرقية", value: 80 },
  { label: "جنوب سيناء", value: 80 },
  { label: "كفر الشيخ", value: 80 },
  { label: "مطروح", value: 80 },
  { label: "الأقصر", value: 80 },
  { label: "قنا", value: 80 },
  { label: "شمال سيناء", value: 80 },
  { label: "سوهاج", value: 85 },
];

const SIZES = ["XS", "S", "M", "L", "XL"];

export default function ShopPage() {
  const { cart, removeFromCart, updateQuantity, updateSize, clearCart } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone1: "",
    customerPhone2: "",
    governorate: "",
    customerAddress: "",
    paymentMethod: "الدفع عند الاستلام",
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const baseTotal = cart.reduce((sum, p) => {
    const price = parseFloat(p.price.replace(/[^\d.]/g, "")) || 0;
    return sum + price * p.quantity;
  }, 0);
  const finalTotal = baseTotal + shipping;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone1 || !form.governorate || !form.customerAddress) {
      alert("Please fill all required fields.");
      return;
    }
    const govLabel = GOVERNORATES.find((g) => String(g.value) === form.governorate)?.label || form.governorate;

    const { error } = await supabase.from("orders").insert({
      customer_name: form.customerName,
      phone1: form.customerPhone1,
      phone2: form.customerPhone2 || null,
      governorate: govLabel,
      address: form.customerAddress,
      payment_method: form.paymentMethod,
      items: cart.map((p) => ({ title: p.title, size: p.size, quantity: p.quantity, price: p.price })),
      shipping_cost: shipping,
      total: finalTotal,
      status: "new",
    });

    if (error) {
      alert("Something went wrong, please try again.");
      return;
    }

    clearCart();
    setShowForm(false);
    setForm({ customerName: "", customerPhone1: "", customerPhone2: "", governorate: "", customerAddress: "", paymentMethod: "Cash on delivery" });
    alert("Order placed successfully! We will contact you soon.");
  }

  return (
    <>
    <section className="min-h-[calc(100vh-56px)] pt-20 pb-10">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-center font-semibold tracking-widest uppercase text-sm text-gray-500 mb-6">
          Cart ({cart.length})
        </h2>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-4 mt-24 text-gray-400">
            <i className="ri-shopping-cart-2-line text-6xl" />
            <p className="tracking-widest uppercase text-sm">Your cart is empty</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cart.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm flex gap-0 relative group"
              >
                {/* Product image */}
                <div className="w-[130px] min-h-[160px] bg-[hsl(0,0%,96%)] flex items-center justify-center shrink-0">
                  <Image
                    src={p.image}
                    alt={p.title}
                    width={110}
                    height={130}
                    className="object-contain drop-shadow-md"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between" dir="rtl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{p.title}</h3>
                      <p className="text-black font-bold mt-1">{p.price}</p>
                    </div>
                    <button
                      onClick={() => { removeFromCart(p.id); if (cart.length <= 1) setShowForm(false); }}
                      className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
                    >
                      <i className="ri-close-line" />
                    </button>
                  </div>

                  {/* Sizes */}
                  <div className="flex gap-1 mt-3">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSize(p.id, s)}
                        className={`w-8 h-8 rounded-full text-xs font-bold border transition-all duration-200 ${
                          p.size === s
                            ? "bg-black text-white border-black"
                            : "border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Quantity + checkout */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                      <button
                        onClick={() => updateQuantity(p.id, p.quantity - 1)}
                        className="text-black font-bold text-lg leading-none w-5 text-center"
                      >−</button>
                      <span className="text-sm font-semibold w-4 text-center">{p.quantity}</span>
                      <button
                        onClick={() => updateQuantity(p.id, p.quantity + 1)}
                        className="text-black font-bold text-lg leading-none w-5 text-center"
                      >+</button>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors tracking-wider"
                    >
                      ORDER
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Total bar */}
            <div className="flex justify-between items-center bg-black text-white px-5 py-3 rounded-2xl mt-2">
              <span className="text-sm tracking-widest uppercase">Total</span>
              <span className="font-bold">{baseTotal.toFixed(2)} EGP</span>
            </div>
          </div>
        )}

        {/* Checkout form */}
        {showForm && cart.length > 0 && (
          <form onSubmit={handleConfirm} className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
            <h5 className="text-center font-semibold tracking-widest uppercase text-sm mb-5">Delivery Details</h5>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input required type="tel" placeholder="Phone number *" value={form.customerPhone1}
                  onChange={(e) => setForm({ ...form, customerPhone1: e.target.value })}
                  className="input-field" />
                <input type="tel" placeholder="Alt. phone" value={form.customerPhone2}
                  onChange={(e) => setForm({ ...form, customerPhone2: e.target.value })}
                  className="input-field" />
              </div>
              <input required type="text" placeholder="Full name *" value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="input-field" />
              <select required value={form.governorate}
                onChange={(e) => { setForm({ ...form, governorate: e.target.value }); setShipping(parseFloat(e.target.value) || 0); }}
                className="input-field text-gray-500">
                <option value="">-- Select governorate --</option>
                {GOVERNORATES.map((g) => (
                  <option key={g.label} value={g.value}>{g.label}</option>
                ))}
              </select>
              <textarea required placeholder="Full address (street, city) *" value={form.customerAddress}
                onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                className="input-field resize-none h-24" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input type="radio" id="cod" name="pay" defaultChecked />
              <label htmlFor="cod" className="text-sm">Cash on delivery</label>
            </div>

            <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3 mt-4 text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>{shipping} EGP</span>
            </div>
            <div className="flex justify-between items-center bg-black text-white rounded-xl px-4 py-3 mt-2">
              <span className="tracking-widest text-sm uppercase">Total</span>
              <span className="font-bold">{finalTotal.toFixed(2)} EGP</span>
            </div>

            <button type="submit"
              className="w-full mt-4 bg-black text-white py-3 rounded-xl font-semibold tracking-widest uppercase hover:bg-gray-900 transition-colors flex items-center justify-center gap-2">
              <i className="ri-whatsapp-line text-green-400 text-lg" />
              Confirm Order
            </button>
            <p className="text-center text-gray-400 text-xs mt-2">🔒 Your info is safe & secure</p>
          </form>
        )}
      </div>
    </section>
    <Footer />
    </>
  );
}
