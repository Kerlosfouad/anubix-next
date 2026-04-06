"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import Footer from "@/components/Footer";

export default function FavoritePage() {
  const { favorites, removeFavorite, addToCart } = useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <section className="min-h-[calc(100vh-56px)] flex justify-center items-start pt-10">
        <div className="container">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center gap-4 mt-24 text-gray-400">
              <i className="ri-heart-line text-6xl" />
              <p className="tracking-widest uppercase text-sm">No favorites yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {favorites.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 relative h-[264px] w-[220px] inline-block shadow-sm">
                  <Image src={p.image} alt={p.title} width={180} height={180} className="mx-auto"
                    style={{ filter: "drop-shadow(-8px 8px 16px hsla(34,51%,8%,0.6))" }} />
                  <h3 className="text-sm font-semibold text-center mt-1">{p.title}</h3>
                  <div className="absolute bottom-2 left-4 right-4 flex justify-between">
                    <button onClick={() => removeFavorite(p.id)}
                      className="flex items-center justify-center w-[85px] h-8 bg-black text-white rounded-full text-sm">
                      <i className="ri-heart-fill text-red-400" />
                    </button>
                    <button onClick={() => addToCart({ title: p.title, price: p.price, image: p.image, size: "M" })}
                      className="flex items-center justify-center w-[85px] h-8 bg-black text-white rounded-full text-sm">
                      <i className="ri-shopping-cart-2-line" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}
