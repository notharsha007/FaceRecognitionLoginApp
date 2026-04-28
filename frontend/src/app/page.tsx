"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AppButton from "./components/AppButton";
import LoginFaceBox, { LoginUser } from "./components/LoginFaceBox";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [error, setError] = useState<string | null>(null);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: "center", pt: 4, mb: 4 }}>
        Welcome to FaceLogin
      </Typography>

      {justRegistered && (
        <Alert severity="success" sx={{ width: 320, mb: 2 }}>
          You have registered successfully. Please log in.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <LoginFaceBox
          onLoginSuccess={(user: LoginUser) => {
            const params = new URLSearchParams({
              name: user.name,
              email: user.email,
              phone: user.phone,
              ...(user.created_at ? { created_at: user.created_at } : {}),
            });
            router.push(`/welcome?${params.toString()}`);
          }}
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
