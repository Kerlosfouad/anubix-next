"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { products } from "@/lib/products";

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
      {/* Slider — takes all remaining space */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-0">
        {/* Circle decoration */}
        <div className="absolute w-[260px] h-[260px] border-[3px] border-white/80 rounded-full flex justify-center items-center pointer-events-none z-0">
          <div className="w-[228px] h-[228px] border-[12px] border-white rounded-full" />
          <h1 className="font-smooch absolute text-[80px] leading-none select-none">ANUBIX</h1>
        </div>
        <div className="w-full relative z-10">
          <ProductSlider products={filtered} />
        </div>
      </div>

      {/* Tab bar — always at bottom, part of normal flow */}
      <div className="flex justify-center pb-3 pt-2 shrink-0">
        <div className="flex bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
                activeTab === tab.id ? "bg-black text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
