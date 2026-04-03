"use client";
import { useEffect, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "shadow-intensity"?: string;
        style?: React.CSSProperties;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
      }, HTMLElement>;
    }
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.type = "module";
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

const HOTSPOTS = [
  {
    slot: "hotspot-1",
    position: "0 0.3 0.1",
    normal: "0 0 1",
    title: "Premium Fabric",
    points: ["100% Polyester", "Sweat-repellent", "Ultra lightweight"],
  },
  {
    slot: "hotspot-2",
    position: "-0.15 0.1 0.05",
    normal: "-1 0 0",
    title: "Perfect Fit",
    points: ["Sizes XS → XL", "Slim cut", "Flexible stretch"],
  },
  {
    slot: "hotspot-3",
    position: "0 -0.1 0.1",
    normal: "0 0 1",
    title: "Design",
    points: ["Exclusive print", "Fade-resistant", "Unique style"],
  },
];

export default function ARTryOn({ onClose }: { shirtImage: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  useEffect(() => {
    loadScript("https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js")
      .then(() => setLoaded(true));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-white">
          <i className="ri-eye-line text-lg" />
          <span className="text-sm font-semibold tracking-widest uppercase">AR Preview</span>
        </div>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-300 transition-colors">
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Model Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {!loaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm tracking-widest uppercase">Loading 3D model...</p>
          </div>
        ) : (
          <>
            {/* @ts-ignore */}
            <model-viewer
              src="/models/src/model-cmnhx81c3027ejvpp74d3snq7.glb"
              alt="T-shirt 3D model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              shadow-intensity="1"
              ar-scale="fixed"
              ar-placement="floor"
              style={{ width: "100%", height: "100%", background: "#111" }}
            >
              {/* Hotspot buttons on the model */}
              {HOTSPOTS.map((h, i) => (
                <button
                  key={h.slot}
                  slot={h.slot}
                  data-position={h.position}
                  data-normal={h.normal}
                  onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "white",
                    border: "3px solid black",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: "bold",
                    color: "black",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {i + 1}
                </button>
              ))}

              {/* AR button */}
              <button
                slot="ar-button"
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                📷 View in your space
              </button>
            {/* @ts-ignore */}
            </model-viewer>

            {/* Annotation popup */}
            {activeHotspot !== null && (
              <div
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-xl w-[220px] z-10"
                style={{ pointerEvents: "none" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                    {activeHotspot + 1}
                  </span>
                  <h4 className="font-bold text-sm">{HOTSPOTS[activeHotspot].title}</h4>
                </div>
                <ul className="flex flex-col gap-1">
                  {HOTSPOTS[activeHotspot].points.map((p) => (
                    <li key={p} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {loaded && (
        <div className="shrink-0 bg-black/80 text-white/50 text-xs text-center py-2 px-4 tracking-wide">
          Tap the numbered dots to learn more · Tap "View in your space" for AR
        </div>
      )}
    </div>
  );
}
