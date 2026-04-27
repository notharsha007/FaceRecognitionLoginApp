"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AppButton from "../components/AppButton";

export default function WelcomePage() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") ?? "User";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <Typography sx={{ fontSize: 72, lineHeight: 1 }}>👋</Typography>
      <Typography variant="h3" component="h1" sx={{ textAlign: "center" }}>
        Hello, {name}!
      </Typography>
      <AppButton onClick={() => router.push("/")}>Logout</AppButton>
    </Box>
  );
}
