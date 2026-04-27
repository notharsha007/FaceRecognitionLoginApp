"use client";

import { useRef, useState, useCallback } from "react";

export type FaceDetectionState = "idle" | "loading" | "scanning" | "processing" | "error";

interface UseFaceDetectionReturn {
  state: FaceDetectionState;
  faceDetected: boolean;
  errorMsg: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
  captureCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  startWebcam: () => Promise<void>;
  captureFrame: () => string | null;
  stopWebcam: () => void;
  setState: (s: FaceDetectionState) => void;
  setErrorMsg: (msg: string | null) => void;
  handleRetry: () => void;
}

export function useFaceDetection(): UseFaceDetectionReturn {
  const [state, setState] = useState<FaceDetectionState>("idle");
  const [faceDetected, setFaceDetected] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const detectingRef = useRef(false);

  function stopDetectionLoop() {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    detectingRef.current = false;
  }

  function stopWebcam() {
    stopDetectionLoop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  const startDetectionLoop = useCallback((faceapi: typeof import("face-api.js")) => {
    detectingRef.current = true;

    async function detect() {
      if (!detectingRef.current) return;

      const video = videoRef.current;
      const overlay = overlayRef.current;

      if (video && overlay && video.readyState >= 2) {
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        const displayW = overlay.clientWidth || 320;
        const displayH = overlay.clientHeight || 260;
        overlay.width = displayW;
        overlay.height = displayH;

        const ctx = overlay.getContext("2d")!;
        ctx.clearRect(0, 0, displayW, displayH);

        if (detection) {
          setFaceDetected(true);

          const scaleX = displayW / (video.videoWidth || displayW);
          const scaleY = displayH / (video.videoHeight || displayH);
          const { x, y, width, height } = detection.box;
          const bx = x * scaleX;
          const by = y * scaleY;
          const bw = width * scaleX;
          const bh = height * scaleY;

          // Bounding box
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 3;
          ctx.strokeRect(bx, by, bw, bh);

          // Corner accents
          const cs = 16;
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(bx, by + cs); ctx.lineTo(bx, by); ctx.lineTo(bx + cs, by); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx + bw - cs, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cs); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx, by + bh - cs); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cs, by + bh); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx + bw - cs, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cs); ctx.stroke();

          // "Face Detected" badge
          const label = "Face Detected";
          ctx.font = "bold 13px sans-serif";
          const textW = ctx.measureText(label).width;
          const badgeX = bx;
          const badgeY = by > 28 ? by - 28 : by + bh + 6;
          ctx.fillStyle = "#22c55e";
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, textW + 16, 22, 6);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.fillText(label, badgeX + 8, badgeY + 15);
        } else {
          setFaceDetected(false);
        }
      }

      if (detectingRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, []);

  async function startWebcam() {
    if (state !== "idle") return;
    setState("loading");
    setErrorMsg(null);

    try {
      const faceapi = await import("face-api.js");
      if (!faceapi.nets.tinyFaceDetector.isLoaded) {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState("scanning");
      startDetectionLoop(faceapi);
    } catch {
      setState("error");
      setErrorMsg("Could not start camera. Please allow camera access and try again.");
    }
  }

  // Captures the current video frame and returns it as a base64 JPEG string.
  // Stops the detection loop and webcam as a side effect.
  function captureFrame(): string | null {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg");

    stopWebcam();
    return base64;
  }

  function handleRetry() {
    setState("idle");
    setFaceDetected(false);
    setErrorMsg(null);
  }

  return {
    state,
    faceDetected,
    errorMsg,
    videoRef,
    overlayRef,
    captureCanvasRef,
    startWebcam,
    captureFrame,
    stopWebcam,
    setState,
    setErrorMsg,
    handleRetry,
  };
}
