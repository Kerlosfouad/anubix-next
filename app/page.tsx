"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { products } from "@/lib/products";
import Footer from "@/components/Footer";

const ProductSlider = dynamic(() => import("@/components/ProductSlider"), { ssr: false });

const tabs = [
  { id: "short", label: "Short" },
  { id: "long", label: "Long" },
  { id: "pants", label: "Pants" },
  { id: "tanktop", label: "Tank" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>("short");
  const filtered = products.filter((p) => p.category === activeTab);

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 56px)" }}>

      {/* Circle — fixed behind slider */}
      <div className="absolute w-[280px] h-[280px] border-[3px] border-white/80 rounded-full flex justify-center items-center pointer-events-none z-0" style={{ top: "calc(50% - 200px)", left: "50%", transform: "translateX(-50%)" }}>
        <div className="w-[246px] h-[246px] border-[12px] border-white rounded-full" />
        <h1 className="font-smooch absolute text-[86px] leading-none select-none">ANUBIX</h1>
      </div>

      {/* Slider — fills space */}
      <div className="flex-1 flex items-center justify-center relative z-10 min-h-0 overflow-hidden w-full">
        <div className="w-full">
          <ProductSlider products={filtered} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
