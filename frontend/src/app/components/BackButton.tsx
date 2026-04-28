"use client";

import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <IconButton
      onClick={() => router.back()}
      sx={{ position: "absolute", top: 16, left: 16 }}
      aria-label="Go back"
    >
      <ArrowBackIcon />
    </IconButton>
  );
}
