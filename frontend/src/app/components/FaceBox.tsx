"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AppButton from "./AppButton";

type FaceBoxState = "idle" | "scanning" | "processing" | "captured" | "error";

interface FaceBoxProps {
  onCapture: (embedding: number[]) => void;
  captured: boolean;
  loginMode?: boolean;
  onLoginSuccess?: (name: string) => void;
  onLoginError?: (message: string) => void;
}

export default function FaceBox({ onCapture, captured, loginMode, onLoginSuccess, onLoginError }: FaceBoxProps) {
  const [state, setState] = useState<FaceBoxState>(captured ? "captured" : "idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function startWebcam() {
    if (state !== "idle") return;
    setErrorMsg(null);
    setState("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setState("error");
      setErrorMsg("Camera access denied. Please allow camera permissions.");
    }
  }

  function stopWebcam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    setState("processing");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg");
    setCapturedImage(base64);

    stopWebcam();

    const endpoint = loginMode ? "/api/login" : "/api/capture-face";

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Failed.");

      if (loginMode) {
        onLoginSuccess?.(data.name);
      } else {
        setState("captured");
        onCapture(data.embedding);
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "Request timed out. Make sure the backend is running."
          : e instanceof Error
          ? e.message
          : "Something went wrong.";

      setState("error");
      setErrorMsg(msg);
      if (loginMode) onLoginError?.(msg);
    }
  }

  function handleRetry() {
    setState("idle");
    setErrorMsg(null);
    setCapturedImage(null);
  }

  const idleLabel = loginMode ? "Click here to login with face" : "Click here to scan face";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Box
        onClick={state === "idle" ? startWebcam : undefined}
        sx={{
          width: 320,
          height: 260,
          border: "2px dashed",
          borderColor:
            state === "captured" ? "success.main" : state === "error" ? "error.main" : "primary.main",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          bgcolor: "background.paper",
          cursor: state === "idle" ? "pointer" : "default",
          overflow: "hidden",
          transition: "border-color 0.2s",
          "&:hover": state === "idle" ? { borderColor: "primary.light", bgcolor: "action.hover" } : {},
        }}
      >
        {state === "idle" && (
          <>
            <Typography sx={{ fontSize: 64, lineHeight: 1 }}>🫥</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", px: 2 }}>
              Face preview will appear here
            </Typography>
            <Typography variant="caption" color="primary" sx={{ textAlign: "center" }}>
              {idleLabel}
            </Typography>
          </>
        )}

        {state === "scanning" && (
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
            muted
          />
        )}

        {state === "processing" && (
          <>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary">
              {loginMode ? "Recognizing face..." : "Processing face..."}
            </Typography>
          </>
        )}

        {state === "captured" && capturedImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Captured face"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
          />
        )}

        {state === "error" && (
          <>
            <Typography sx={{ fontSize: 56, lineHeight: 1 }}>❌</Typography>
            <Typography variant="body2" color="error" sx={{ textAlign: "center", px: 2 }}>
              {errorMsg}
            </Typography>
          </>
        )}
      </Box>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {state === "scanning" && (
        <AppButton onClick={handleCapture}>Capture</AppButton>
      )}

      {state === "error" && (
        <AppButton onClick={handleRetry}>Try Again</AppButton>
      )}
    </Box>
  );
}
