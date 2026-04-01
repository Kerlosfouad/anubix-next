"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  shirtImage: string;
  onClose: () => void;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(s);
  });
}

export default function ARTryOn({ shirtImage, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const detectorRef = useRef<any>(null);
  const shirtImgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const img = new window.Image();
    img.src = shirtImage;
    img.onload = () => { shirtImgRef.current = img; };
  }, [shirtImage]);

  const drawShirt = useCallback((
    ctx: CanvasRenderingContext2D,
    keypoints: any[],
    W: number, H: number
  ) => {
    const img = shirtImgRef.current;
    if (!img) return;

    const kp: Record<string, any> = {};
    keypoints.forEach((k: any) => { kp[k.name] = k; });

    const ls = kp["left_shoulder"];
    const rs = kp["right_shoulder"];
    const lh = kp["left_hip"];
    const rh = kp["right_hip"];

    if (!ls || !rs) return;
    if ((ls.score ?? 0) < 0.3 || (rs.score ?? 0) < 0.3) return;

    // mirror x
    const lsX = W - ls.x, lsY = ls.y;
    const rsX = W - rs.x, rsY = rs.y;
    const shoulderW = Math.abs(rsX - lsX);
    const shirtW = shoulderW * 1.45;
    const cx = (lsX + rsX) / 2;
    const sy = (lsY + rsY) / 2;

    let shirtH = shirtW * 1.1;
    if (lh && rh && (lh.score ?? 0) > 0.25 && (rh.score ?? 0) > 0.25) {
      shirtH = ((lh.y + rh.y) / 2 - sy) * 1.2;
    }

    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.drawImage(img, cx - shirtW / 2, sy - shirtH * 0.12, shirtW, shirtH);
    ctx.restore();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Load TF.js + MoveNet entirely from CDN (no npm imports)
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");

        if (cancelled) return;

        const w = window as any;
        const tf = w.tf;
        const poseDetection = w.poseDetection;

        if (!tf || !poseDetection) throw new Error("Failed to load TensorFlow");

        await tf.ready();

        // Camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        });
        if (cancelled) { stream.getTracks().forEach((t: any) => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        // MoveNet detector
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        if (cancelled) { detector.dispose(); return; }
        detectorRef.current = detector;
        if (!cancelled) setStatus("ready");

        // Render loop
        const loop = async () => {
          if (cancelled) return;
          const canvas = canvasRef.current!;
          const W = video.videoWidth || 640;
          const H = video.videoHeight || 480;
          canvas.width = W;
          canvas.height = H;

          const ctx = canvas.getContext("2d")!;
          ctx.clearRect(0, 0, W, H);

          // mirrored video
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -W, 0, W, H);
          ctx.restore();

          if (video.readyState >= 2) {
            try {
              const poses = await detector.estimatePoses(video);
              if (poses.length > 0) drawShirt(ctx, poses[0].keypoints, W, H);
            } catch (_) { /* skip frame */ }
          }

          animFrameRef.current = requestAnimationFrame(loop);
        };
        loop();

      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Could not start AR");
          setStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      detectorRef.current?.dispose?.();
    };
  }, [drawShirt]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 text-white">
          <i className="ri-eye-line text-lg" />
          <span className="text-sm font-semibold tracking-widest uppercase">AR Try-On</span>
        </div>
        <button onClick={onClose} className="text-white text-2xl hover:text-gray-300 transition-colors">
          <i className="ri-close-line" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black">
        <video ref={videoRef} className="hidden" playsInline muted />
        <canvas ref={canvasRef} className="w-full h-full object-contain" />

        {status === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm tracking-widest uppercase">Loading AI model...</p>
            <p className="text-white/40 text-xs">First load may take ~15 seconds</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-8 text-center">
            <i className="ri-camera-off-line text-white/50 text-6xl" />
            <p className="text-white text-sm">{errorMsg}</p>
            <button onClick={onClose} className="mt-2 px-6 py-2 bg-white text-black rounded-full text-sm font-semibold">
              Close
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full tracking-wider">
            Stand back so your full torso is visible
          </div>
        )}
      </div>
    </div>
  );
}
