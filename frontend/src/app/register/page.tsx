"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AppButton from "../components/AppButton";
import FaceBox from "../components/FaceBox";

export default function RegisterPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: "center", pt: 4, mb: 4 }}>
        Register to FaceLogin
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FaceBox />
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <TextField label="Name" variant="outlined" sx={{ width: 320 }} />
        <TextField label="Email" variant="outlined" type="email" sx={{ width: 320 }} />
        <TextField label="Phone Number" variant="outlined" type="tel" sx={{ width: 320 }} />
        <AppButton sx={{ mt: 1 }}>Register Face</AppButton>
      </Box>
    </Box>
  );
}
