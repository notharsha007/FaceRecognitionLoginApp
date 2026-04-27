"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function FaceBox() {
  return (
    <Box
      sx={{
        width: 320,
        height: 260,
        border: "2px dashed",
        borderColor: "primary.main",
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Typography sx={{ fontSize: 64, lineHeight: 1 }}>🫥</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", px: 2 }}>
        Face preview will appear here
      </Typography>
    </Box>
  );
}
