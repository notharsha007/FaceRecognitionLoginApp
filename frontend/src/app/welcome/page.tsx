"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AppButton from "../components/AppButton";
import BackButton from "../components/BackButton";

export default function WelcomePage() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") ?? "User";

  useEffect(() => {
    fetch("http://localhost:8000/api/verify", { credentials: "include" })
      .then((res) => { if (!res.ok) router.replace("/"); })
      .catch(() => router.replace("/"));
  }, [router]);
  const email = params.get("email");
  const phone = params.get("phone");
  const createdAt = params.get("created_at");

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        position: "relative",
      }}
    >
      <BackButton />
      <Typography variant="h3" component="h1" sx={{ textAlign: "center" }}>
        Hello, {name}!
      </Typography>

      <Box
        sx={{
          width: 340,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          px: 3,
          py: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
          Account Details
        </Typography>
        <Divider />

        <Detail label="Name" value={name} />
        {email && <Detail label="Email" value={email} />}
        {phone && <Detail label="Phone" value={phone} />}
        {memberSince && <Detail label="Member since" value={memberSince} />}
      </Box>

      <AppButton onClick={() => {
        fetch("http://localhost:8000/api/logout", { method: "POST", credentials: "include" })
          .finally(() => router.push("/"));
      }}>Logout</AppButton>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </Typography>
    </Box>
  );
}
