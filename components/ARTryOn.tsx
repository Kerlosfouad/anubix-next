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

// Hotspots: position on the 3D model
const HOTSPOTS = [
  {
    slot: "hotspot-neck",
    position: "0 0.52 0.08",
    normal: "0 1 0",
    side: "right" as const,
    title: "Collar",
    points: ["Ribbed crew neck", "Keeps shape", "Comfortable fit"],
  },
  {
    slot: "hotspot-sleeve",
    position: "-0.22 0.28 0.05",
    normal: "-1 0 0",
    side: "left" as const,
    title: "Sleeve",
    points: ["Raglan cut", "Full range of motion", "Anti-chafe seams"],
  },
  {
    slot: "hotspot-body",
    position: "0.05 0.05 0.1",
    normal: "0 0 1",
    side: "right" as const,
    title: "Body",
    points: ["Sweat-repellent", "100% Polyester", "Ultra lightweight"],
  },
];

export default function ARTryOn({ onClose }: { shirtImage: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);

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
          // @ts-ignore
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
            {HOTSPOTS.map((h) => (
              <div
                key={h.slot}
                slot={h.slot}
                data-position={h.position}
                data-normal={h.normal}
                style={{ display: "flex", alignItems: "center", pointerEvents: "none" }}
              >
                {/* Left-side card */}
                {h.side === "left" && (
                  <div style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 10,
                    padding: "6px 10px",
                    marginRight: 6,
                    minWidth: 110,
                    textAlign: "right",
                  }}>
                    <p style={{ color: "white", fontWeight: 700, fontSize: 11, marginBottom: 3, letterSpacing: "0.05em" }}>
                      {h.title}
                    </p>
                    {h.points.map((p) => (
                      <div key={p} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginBottom: 2 }}>
                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>{p}</span>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Line + dot */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  {h.side === "right" && (
                    <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.7)" }} />
                  )}
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "white",
                    border: "2px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 0 0 3px rgba(255,255,255,0.2)",
                    flexShrink: 0,
                  }} />
                  {h.side === "left" && (
                    <div style={{ width: 24, height: 1, background: "rgba(255,255,255,0.7)" }} />
                  )}
                </div>

                {/* Right-side card */}
                {h.side === "right" && (
                  <div style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 10,
                    padding: "6px 10px",
                    marginLeft: 6,
                    minWidth: 110,
                  }}>
                    <p style={{ color: "white", fontWeight: 700, fontSize: 11, marginBottom: 3, letterSpacing: "0.05em" }}>
                      {h.title}
                    </p>
                    {h.points.map((p) => (
                      <div key={p} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", flexShrink: 0 }} />
                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                pointerEvents: "all",
              }}
            >
              📷 View in your space
            </button>
          {/* @ts-ignore */}
          </model-viewer>
        )}
      </div>

      {loaded && (
        <div className="shrink-0 bg-black/80 text-white/50 text-xs text-center py-2 px-4 tracking-wide">
          Drag to rotate · Tap "View in your space" for AR
        </div>
      )}
    </div>
  );
}
