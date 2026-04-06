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

const HOTSPOTS = [
  {
    slot: "hotspot-neck",
    position: "0 0.52 0.08",
    normal: "0 1 0",
    title: "Collar",
    points: ["Ribbed crew neck", "Keeps shape", "Comfortable fit"],
    card: { top: 110, right: 16 },
  },
  {
    slot: "hotspot-sleeve",
    position: "-0.22 0.28 0.05",
    normal: "-1 0 0",
    title: "Sleeve",
    points: ["Raglan cut", "Full range of motion", "Anti-chafe seams"],
    card: { top: 260, left: 16 },
  },
  {
    slot: "hotspot-body",
    position: "0.05 0.0 0.1",
    normal: "0 0 1",
    title: "Fabric",
    points: ["Sweat-repellent", "100% Polyester", "Ultra lightweight"],
    card: { top: 400, right: 16 },
  },
];

export default function ARTryOn({ onClose }: { shirtImage: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const modelRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; key: string }[]>([]);

  useEffect(() => {
    loadScript("https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js")
      .then(() => setLoaded(true));
  }, []);

  // Draw lines from dots to cards
  useEffect(() => {
    if (!loaded) return;
    const update = () => {
      const mv = modelRef.current;
      const overlay = overlayRef.current;
      if (!mv || !overlay) return;

      const overlayRect = overlay.getBoundingClientRect();
      const newLines: typeof lines = [];

      HOTSPOTS.forEach((h) => {
        // dot is inside model-viewer shadow DOM — use its bounding rect
        const dot = mv.querySelector(`[slot="${h.slot}"]`) as HTMLElement;
        const card = overlay.querySelector(`[data-card="${h.slot}"]`) as HTMLElement;
        if (!dot || !card) return;

        const dotRect = dot.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        const x1 = dotRect.left + dotRect.width / 2 - overlayRect.left;
        const y1 = dotRect.top + dotRect.height / 2 - overlayRect.top;
        const cx = cardRect.left + cardRect.width / 2 - overlayRect.left;
        const x2 = x1 < cx ? cardRect.left - overlayRect.left : cardRect.right - overlayRect.left;
        const y2 = cardRect.top + cardRect.height / 2 - overlayRect.top;

        newLines.push({ x1, y1, x2, y2, key: h.slot });
      });
      setLines(newLines);
    };

    const id = setInterval(update, 80);
    return () => clearInterval(id);
  }, [loaded]);

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-white">
            <i className="ri-eye-line text-lg" />
            <span className="text-sm font-semibold tracking-widest uppercase">AR Preview</span>
          </div>
          <button onClick={onClose} className="text-white text-2xl">
            <i className="ri-close-line" />
          </button>
        </div>

        {/* model-viewer */}
        <div className="flex-1 relative">
          {!loaded ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-white text-sm tracking-widest uppercase">Loading 3D model...</p>
            </div>
          ) : (
            // @ts-ignore
            <model-viewer
              ref={modelRef}
              src="/models/src/spider1.glb"
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
              {HOTSPOTS.map((h) => (
                <div
                  key={h.slot}
                  slot={h.slot}
                  data-position={h.position}
                  data-normal={h.normal}
                  style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 0 0 4px rgba(255,255,255,0.3)",
                    pointerEvents: "none",
                  }}
                />
              ))}
              <button
                slot="ar-button"
                style={{
                  position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
                  background: "white", color: "black", border: "none", borderRadius: 999,
                  padding: "12px 24px", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)", pointerEvents: "all",
                }}
              >
                📷 View in your space
              </button>
            {/* @ts-ignore */}
            </model-viewer>
          )}
        </div>

        {loaded && (
          <div className="shrink-0 bg-black/80 text-white/40 text-xs text-center py-2 tracking-wide">
            Drag to rotate · Tap "View in your space" for AR
          </div>
        )}
      </div>

      {/* Overlay — completely separate from model-viewer, higher z-index */}
      {loaded && (
        <div
          ref={overlayRef}
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 200 }}
        >
          {/* SVG lines */}
          <svg className="absolute inset-0 w-full h-full">
            {lines.map((l) => (
              <line
                key={l.key}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
            ))}
          </svg>

          {/* Cards */}
          {HOTSPOTS.map((h) => (
            <div
              key={h.slot}
              data-card={h.slot}
              className="absolute"
              style={h.card as React.CSSProperties}
            >
              <div style={{
                background: "rgba(10,10,10,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "8px 12px",
                minWidth: 130,
              }}>
                <p style={{ color: "white", fontWeight: 700, fontSize: 12, marginBottom: 6, letterSpacing: "0.06em" }}>
                  {h.title}
                </p>
                {h.points.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", flexShrink: 0 }} />
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
