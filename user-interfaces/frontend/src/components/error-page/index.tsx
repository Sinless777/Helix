"use client";

import { Header } from "@frontend/components";
import { Box, Typography, Button } from "@mui/material";
import { headerProps } from "@frontend/constants/header";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function ErrorPage({ title, message, showRetry, onRetry }: Props) {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", color: "#fff" }}>
      <Header {...headerProps} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 64px)",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {message}
        </Typography>

        {showRetry && onRetry && (
          <Button
            variant="contained"
            color="secondary"
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        )}

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.push("/")}
          sx={{ mt: 2 }}
        >
          Go to Home
        </Button>
      </Box>
    </Box>
  );
}

export default ErrorPage;
