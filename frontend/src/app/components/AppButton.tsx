"use client";

import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";

export default function AppButton({ children, ...props }: ButtonProps) {
  return (
    <Button variant="contained" size="large" sx={{ width: 220, ...props.sx }} {...props}>
      {children}
    </Button>
  );
}
