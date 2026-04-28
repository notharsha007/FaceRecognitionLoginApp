"use client";

import { useRef, useState, useCallback } from "react";
import { drawFaceBox } from "../utils/drawFaceBox";

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
          drawFaceBox(ctx, detection, displayW, displayH, video.videoWidth || displayW, video.videoHeight || displayH);
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
