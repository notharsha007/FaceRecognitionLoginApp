"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AppButton from "../components/AppButton";
import FaceBox from "../components/FaceBox";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (!faceEmbedding) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, face_embedding: faceEmbedding }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Registration failed.");
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Typography sx={{ fontSize: 72 }}>🎉</Typography>
        <Typography variant="h5">Registered successfully!</Typography>
        <Typography variant="body2" color="text.secondary">You can now log in with your face.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: "center", pt: 4, mb: 4 }}>
        Register to FaceLogin
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FaceBox
          onCapture={(embedding) => setFaceEmbedding(embedding)}
          captured={faceEmbedding !== null}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <TextField
          label="Name"
          variant="outlined"
          sx={{ width: 320 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          sx={{ width: 320 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Phone Number"
          variant="outlined"
          type="tel"
          sx={{ width: 320 }}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {error && <Alert severity="error" sx={{ width: 320 }}>{error}</Alert>}

        <AppButton
          sx={{ mt: 1 }}
          onClick={handleRegister}
          disabled={!faceEmbedding || loading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : "Register Face"}
        </AppButton>

        {!faceEmbedding && (
          <Typography variant="caption" color="text.secondary">
            Please scan your face before registering.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
