"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { Product } from "@/lib/products";

const ARTryOn = dynamic(() => import("./ARTryOn"), { ssr: false });

interface Props {
  products: Product[];
}

export default function ProductSlider({ products }: Props) {
  const { addToCart, toggleFavorite, favoriteStates } = useStore();
  const [mounted, setMounted] = useState(false);
  const [arProduct, setArProduct] = useState<Product | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="w-full relative pb-8">
        <Swiper
          modules={[Navigation]}
          loop
          grabCursor
          centeredSlides
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            765: { slidesPerView: 3, centeredSlides: true },
            1152: { slidesPerView: 3, spaceBetween: -60, centeredSlides: true },
          }}
        >
          {products.map((p) => (
            <SwiperSlide key={p.id}>
              <article className="text-center select-none">
                {/* Image */}
                <div className="relative mx-auto w-[200px] h-[220px] flex items-center justify-center">
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={200}
                    height={220}
                    className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                    style={{ filter: "drop-shadow(-6px 12px 20px rgba(0,0,0,0.18))" }}
                  />
                </div>

                {/* Info */}
                <h3 className="font-semibold text-sm mt-3 tracking-wide">{p.name}</h3>
                <p className="text-sm font-bold mt-0.5 mb-3">{p.price}</p>

                {/* Actions */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {/* Favorite */}
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

                  {/* Add to cart */}
                  <button
                    onClick={() => addToCart({ title: p.name, price: p.price, image: p.image, size: "M" })}
                    className="inline-flex items-center justify-center gap-1 px-4 h-10 rounded-full bg-black text-white text-xs font-semibold tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    <i className="ri-shopping-cart-2-line text-sm" />
                    ADD
                  </button>

                  {/* AR Preview */}
                  <button
                    onClick={() => setArProduct(p)}
                    className="inline-flex items-center justify-center gap-1 px-4 h-10 rounded-full bg-white border-2 border-gray-200 text-black text-xs font-semibold tracking-wider hover:border-black transition-colors"
                  >
                    <i className="ri-eye-line text-sm" />
                    PREVIEW
                  </button>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-button-prev"><i className="ri-arrow-left-line" /></div>
        <div className="swiper-button-next"><i className="ri-arrow-right-line" /></div>
      </div>

      {/* AR Modal */}
      {arProduct && (
        <ARTryOn
          shirtImage={arProduct.image}
          onClose={() => setArProduct(null)}
        />
      )}
    </>
  );
}
