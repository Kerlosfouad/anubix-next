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
    <div className="flex flex-col items-center justify-center" style={{ height: "calc(100dvh - 56px)" }}>

      {/* Slider */}
      <div className="w-full relative z-10">
        <ProductSlider products={filtered} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      </div>

    </div>
  );
}
