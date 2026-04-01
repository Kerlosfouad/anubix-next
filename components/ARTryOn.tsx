"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  shirtImage: string;
  onClose: () => void;
}

// Declare model-viewer as a valid JSX element
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
        exposure?: string;
        style?: React.CSSProperties;
        poster?: string;
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
    s.onerror = () => resolve(); // continue even if fails
    document.head.appendChild(s);
  });
}

export default function ARTryOn({ onClose }: Props) {
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
      <div className="flex-1 relative">
        {!loaded ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm tracking-widest uppercase">Loading 3D model...</p>
          </div>
        ) : (
          // @ts-ignore
          <model-viewer
            src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
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
            {/* AR button */}
            {/* @ts-ignore */}
            <button
              slot="ar-button"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-semibold text-sm tracking-widest uppercase flex items-center gap-2 shadow-lg"
            >
              <i className="ri-camera-line" />
              View in your space
            </button>
          {/* @ts-ignore */}
          </model-viewer>
        )}
      </div>

      {/* Hint */}
      {loaded && (
        <div className="shrink-0 bg-black/80 text-white/60 text-xs text-center py-3 px-4 tracking-wide">
          Drag to rotate · Pinch to zoom · Tap "View in your space" for AR
        </div>
      )}
    </div>
  );
}
