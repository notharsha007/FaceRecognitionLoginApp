"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AppButton from "./components/AppButton";
import FaceBox from "./components/FaceBox";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: "center", pt: 4, mb: 4 }}>
        Welcome to FaceLogin
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FaceBox
          onCapture={() => {}}
          captured={false}
          loginMode
          onLoginSuccess={(name) => router.push(`/welcome?name=${encodeURIComponent(name)}`)}
          onLoginError={(msg) => setError(msg)}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ width: 320, mb: 2 }}>{error}</Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Typography variant="body1">New to FaceLogin? Register here</Typography>
        <AppButton onClick={() => router.push("/register")}>Register</AppButton>
      </Box>
    </Box>
  );
}
