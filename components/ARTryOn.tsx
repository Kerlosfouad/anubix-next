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
        "auto-rotate-delay"?: string;
        "rotation-per-second"?: string;
        "shadow-intensity"?: string;
        style?: React.CSSProperties;
        "ar-scale"?: string;
        "ar-placement"?: string;
        "camera-orbit"?: string;
        "animation-name"?: string;
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

export default function ARTryOn({ onClose }: { shirtImage: string; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    loadScript("https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js")
      .then(() => {
        setLoaded(true);
        // trigger reveal animation after model loads
        setTimeout(() => setRevealed(true), 300);
      });
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

      {/* Model area */}
      <div className="flex-1 relative overflow-hidden">
        {!loaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm tracking-widest uppercase">Loading 3D model...</p>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              transform: revealed ? "translateY(0) scale(1)" : "translateY(100%) scale(0.6)",
              opacity: revealed ? 1 : 0,
              transition: "transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease",
            }}
          >
            {/* @ts-ignore */}
            <model-viewer
              src="/models/src/Untitled.glb"
              alt="T-shirt 3D model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              auto-rotate
              auto-rotate-delay="0"
              rotation-per-second="30deg"
              shadow-intensity="1"
              ar-scale="fixed"
              ar-placement="floor"
              camera-orbit="0deg 75deg 2.5m"
              style={{ width: "100%", height: "100%", background: "#111" }}
            >
              <button
                slot="ar-button"
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: 999,
                  padding: "12px 28px",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                📷 View in your space
              </button>
            {/* @ts-ignore */}
            </model-viewer>
          </div>
        )}
      </div>

      {loaded && (
        <div className="shrink-0 bg-black/80 text-white/40 text-xs text-center py-2 tracking-wide">
          Drag to rotate · Pinch to zoom · Tap "View in your space" for AR
        </div>
      )}
    </div>
  );
}
