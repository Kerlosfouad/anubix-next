"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string; alt?: string; ar?: boolean; "ar-modes"?: string;
        "camera-controls"?: boolean; "auto-rotate"?: boolean;
        "shadow-intensity"?: string; style?: React.CSSProperties;
        "ar-scale"?: string; "ar-placement"?: string;
      }, HTMLElement>;
    }
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.type = "module"; s.src = src;
    s.onload = () => resolve(); s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

// Hotspot positions on model + where the card appears on screen
const HOTSPOTS = [
  {
    slot: "hotspot-neck",
    position: "0 0.52 0.08",
    normal: "0 1 0",
    title: "Collar",
    points: ["Ribbed crew neck", "Keeps shape", "Comfortable fit"],
    // card position: top-right corner
    cardStyle: { top: 80, right: 16 },
    dotId: "dot-neck",
  },
  {
    slot: "hotspot-sleeve",
    position: "-0.22 0.28 0.05",
    normal: "-1 0 0",
    title: "Sleeve",
    points: ["Raglan cut", "Full range of motion", "Anti-chafe seams"],
    // card position: middle-left
    cardStyle: { top: "40%", left: 16 },
    dotId: "dot-sleeve",
  },
  {
    slot: "hotspot-body",
    position: "0.05 0.0 0.1",
    normal: "0 0 1",
    title: "Fabric",
    points: ["Sweat-repellent", "100% Polyester", "Ultra lightweight"],
    // card position: bottom-right
    cardStyle: { bottom: 80, right: 16 },
    dotId: "dot-body",
  },
];

export default function ARTryOn({ onClose }: { shirtImage: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; key: string }[]>([]);

  useEffect(() => {
    loadScript("https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js")
      .then(() => setLoaded(true));
  }, []);

  // Update SVG lines connecting dots to cards
  useEffect(() => {
    if (!loaded) return;
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newLines: typeof lines = [];

      HOTSPOTS.forEach((h) => {
        const dot = container.querySelector(`[slot="${h.slot}"]`) as HTMLElement;
        const card = container.querySelector(`[data-card="${h.slot}"]`) as HTMLElement;
        if (!dot || !card) return;

        const dotRect = dot.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        const x1 = dotRect.left + dotRect.width / 2 - rect.left;
        const y1 = dotRect.top + dotRect.height / 2 - rect.top;

        // Connect to nearest edge of card
        const cx = cardRect.left + cardRect.width / 2 - rect.left;
        const cy = cardRect.top + cardRect.height / 2 - rect.top;
        const x2 = x1 < cx ? cardRect.left - rect.left : cardRect.right - rect.left;
        const y2 = cardRect.top + cardRect.height / 2 - rect.top;

        newLines.push({ x1, y1, x2, y2, key: h.slot });
      });
      setLines(newLines);
    };

    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [loaded]);

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

      {/* Model + Annotations */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
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
              {/* Dots on model */}
              {HOTSPOTS.map((h) => (
                <div
                  key={h.slot}
                  slot={h.slot}
                  data-position={h.position}
                  data-normal={h.normal}
                  style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 0 0 3px rgba(255,255,255,0.35), 0 0 10px rgba(255,255,255,0.5)",
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* AR button */}
              <button
                slot="ar-button"
                style={{
                  position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                  background: "white", color: "black", border: "none", borderRadius: 999,
                  padding: "12px 24px", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)", pointerEvents: "all",
                }}
              >
                📷 View in your space
              </button>
            {/* @ts-ignore */}
            </model-viewer>

            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              {lines.map((l) => (
                <line
                  key={l.key}
                  x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                  stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              ))}
            </svg>

            {/* Cards — fixed positions on screen edges */}
            {HOTSPOTS.map((h) => (
              <div
                key={h.slot}
                data-card={h.slot}
                className="absolute z-20 pointer-events-none"
                style={h.cardStyle as React.CSSProperties}
              >
                <div
                  style={{
                    background: "rgba(20,20,20,0.75)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    padding: "8px 12px",
                    minWidth: 120,
                    maxWidth: 140,
                  }}
                >
                  <p style={{ color: "white", fontWeight: 700, fontSize: 12, marginBottom: 5, letterSpacing: "0.06em" }}>
                    {h.title}
                  </p>
                  {h.points.map((p) => (
                    <div key={p} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, lineHeight: 1.3 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {loaded && (
        <div className="shrink-0 bg-black/80 text-white/40 text-xs text-center py-2 tracking-wide">
          Drag to rotate · Tap "View in your space" for AR
        </div>
      )}
    </div>
  );
}
