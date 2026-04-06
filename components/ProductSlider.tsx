"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { Product } from "@/lib/products";

const ARTryOn = dynamic(() => import("./ARTryOn"), { ssr: false });

const TABS = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "pants", label: "Pants" },
  { id: "tanktop", label: "Tank" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  products: Product[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  tabs: typeof TABS;
}

export default function ProductSlider({ products, activeTab, onTabChange, tabs }: Props) {
  const { addToCart, toggleFavorite, favoriteStates } = useStore();
  const [mounted, setMounted] = useState(false);
  const [arProduct, setArProduct] = useState<Product | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product>(products[0]);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (products[0]) setActiveProduct(products[0]); }, [products]);

  return (
    <>
      <div className="w-full">
        <Swiper
          modules={[Navigation]}
          loop
          grabCursor
          centeredSlides
          speed={250}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          onSlideChange={(swiper) => {
            const idx = swiper.realIndex;
            if (products[idx]) setActiveProduct(products[idx]);
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            765: { slidesPerView: 3, centeredSlides: true },
            1152: { slidesPerView: 3, spaceBetween: -60, centeredSlides: true },
          }}
        >
          {products.map((p) => (
            <SwiperSlide key={p.id}>
              <article className="text-center select-none relative">
                <div className="relative mx-auto w-[200px] h-[220px] flex items-center justify-center z-10">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={200}
                    height={220}
                    priority
                    className="object-contain w-full h-full transition-transform duration-200 hover:scale-105"
                    style={{ filter: "drop-shadow(-6px 12px 20px rgba(0,0,0,0.18))" }}
                  />
                </div>
                <h3 className="font-semibold text-sm mt-3 tracking-wide">{p.name}</h3>
                <p className="text-sm font-bold mt-0.5 mb-3">{p.price}</p>

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => toggleFavorite({ id: p.id, title: p.name, price: p.price, image: p.image })}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                      mounted && favoriteStates[p.id]
                        ? "bg-black border-black text-red-400"
                        : "bg-white border-gray-200 text-gray-400 hover:border-black hover:text-red-400"
                    }`}
                  >
                    <i className="ri-heart-fill text-base" />
                  </button>
                  <button
                    onClick={() => addToCart({ title: p.name, price: p.price, image: p.image, size: "M" })}
                    className="inline-flex items-center justify-center gap-1 px-4 h-10 rounded-full bg-black text-white text-xs font-semibold tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    <i className="ri-shopping-cart-2-line text-sm" />
                    ADD
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Row: prev — PREVIEW — next */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="swiper-button-prev !static !transform-none !w-9 !h-9 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:border-black transition-colors cursor-pointer">
            <i className="ri-arrow-left-s-line text-lg" />
          </div>
          <button
            onClick={() => activeProduct && setArProduct(activeProduct)}
            className="inline-flex items-center justify-center gap-1.5 px-5 h-9 rounded-full bg-white border-2 border-gray-200 text-black text-xs font-semibold tracking-wider hover:border-black transition-colors"
          >
            <i className="ri-eye-line text-sm" />
            PREVIEW
          </button>
          <div className="swiper-button-next !static !transform-none !w-9 !h-9 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white hover:border-black transition-colors cursor-pointer">
            <i className="ri-arrow-right-s-line text-lg" />
          </div>
        </div>

        {/* Tab bar — directly below arrows */}
        <div className="flex justify-center mt-3 pt-10">
          <div className="flex bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-5 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
                  activeTab === tab.id ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {arProduct && (
        <ARTryOn
          shirtImage={arProduct.image}
          onClose={() => setArProduct(null)}
        />
      )}
    </>
  );
}
