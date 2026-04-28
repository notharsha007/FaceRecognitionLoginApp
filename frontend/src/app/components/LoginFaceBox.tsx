"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AppButton from "./AppButton";
import { useFaceDetection } from "../hooks/useFaceDetection";

export interface LoginUser {
  name: string;
  email: string;
  phone: string;
  created_at: string | null;
}

interface Props {
  onLoginSuccess: (user: LoginUser) => void;
  onLoginError: (message: string) => void;
}

export default function LoginFaceBox({ onLoginSuccess, onLoginError }: Props) {
  const {
    state, faceDetected, errorMsg,
    videoRef, overlayRef, captureCanvasRef,
    startWebcam, captureFrame, setState, setErrorMsg, handleRetry,
  } = useFaceDetection();

  async function handleCapture() {
    setState("processing");
    const base64 = captureFrame();
    if (!base64) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
        signal: controller.signal,
        credentials: "include",
      });
      clearTimeout(timeout);

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Face not recognized.");

      onLoginSuccess({ name: data.name, email: data.email, phone: data.phone, created_at: data.created_at });
    } catch (e: unknown) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "Request timed out. Make sure the backend is running."
          : e instanceof Error ? e.message : "Something went wrong.";
      setState("error");
      setErrorMsg(msg);
      onLoginError(msg);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Box
        onClick={state === "idle" ? startWebcam : undefined}
        sx={{
          position: "relative",
          width: 320,
          height: 260,
          border: "2px dashed",
          borderColor:
            state === "error" ? "error.main"
            : faceDetected ? "#22c55e"
            : "primary.main",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          cursor: state === "idle" ? "pointer" : "default",
          transition: "border-color 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": state === "idle" ? { borderColor: "primary.light", bgcolor: "action.hover" } : {},
        }}
      >
        {state === "idle" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, px: 2 }}>
            <Typography sx={{ fontSize: 64, lineHeight: 1 }}>🫥</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Face preview will appear here
            </Typography>
            <Typography variant="caption" color="primary" sx={{ textAlign: "center" }}>
              Click here to login with face
            </Typography>
          </Box>
        )}

        {state === "loading" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">Loading face detector...</Typography>
          </Box>
        )}

        {/* Always in DOM so videoRef is available during loading state */}
        <video
          ref={videoRef}
          style={{
            display: state === "scanning" ? "block" : "none",
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }}
          muted playsInline
        />
        <canvas
          ref={overlayRef}
          style={{
            display: state === "scanning" ? "block" : "none",
            position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none",
          }}
        />
        {state === "scanning" && (
          <Box sx={{
            position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
            px: 1.5, py: 0.5, borderRadius: 2,
            bgcolor: faceDetected ? "rgba(34,197,94,0.85)" : "rgba(0,0,0,0.55)",
            color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
            whiteSpace: "nowrap", transition: "background-color 0.3s",
          }}>
            {faceDetected ? "Face Detected — Ready to Login" : "Scanning for face..."}
          </Box>
        )}

        {state === "processing" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary">Recognizing face...</Typography>
          </Box>
        )}

        {state === "error" && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, px: 2 }}>
            <Typography sx={{ fontSize: 48, lineHeight: 1 }}>❌</Typography>
            <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>{errorMsg}</Typography>
          </Box>
        )}
      </Box>

      <canvas ref={captureCanvasRef} style={{ display: "none" }} />

      {state === "scanning" && (
        <AppButton onClick={handleCapture} disabled={!faceDetected}>
          {faceDetected ? "Login with Face" : "Waiting for face..."}
        </AppButton>
      )}
      {state === "error" && <AppButton onClick={handleRetry}>Try Again</AppButton>}
    </Box>
  );
}
