"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Link as MuiLink,
  Divider,
  IconButton,
  Container,
} from "@mui/material";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from "@mui/icons-material/Google";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openToast, setOpenToast] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseToast = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpenToast(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Box
        bgcolor="#fff8f0"
        p={5}
        borderRadius={3}
        boxShadow="0 2px 8px rgba(0,0,0,0.1)"
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          mb={4}
          color="#4a4a4a"
          fontWeight="600"
        >
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              sx={{
                "& label": { color: "#4a4a4a" },
                "& input": { color: "#4a4a4a" },
              }}
            />
            <TextField
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              sx={{
                "& label": { color: "#4a4a4a" },
                "& input": { color: "#4a4a4a" },
              }}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              sx={{
                "& label": { color: "#4a4a4a" },
                "& input": { color: "#4a4a4a" },
              }}
            />

            <Button
              variant="contained"
              sx={{
                backgroundColor: "#800020",
                "&:hover": { backgroundColor: "#4b0013" },
                color: "white",
                fontWeight: "600",
              }}
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Divider sx={{ my: 3, fontWeight: "600", color: "#666" }}>OR</Divider>

            <Stack direction="row" spacing={3} justifyContent="center">
              <IconButton
                aria-label="sign up with Google"
                sx={{
                  color: "#c4973f",
                  bgcolor: "#fff8f0",
                  borderRadius: 1,
                  boxShadow: "0 0 8px #c4973f80",
                }}
              >
                <GoogleIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="sign up with Facebook"
                sx={{
                  color: "#3b5998",
                  bgcolor: "#fff8f0",
                  borderRadius: 1,
                  boxShadow: "0 0 8px #3b599880",
                }}
              >
                <FacebookIcon fontSize="large" />
              </IconButton>
              <IconButton
                aria-label="sign up with Twitter"
                sx={{
                  color: "#1da1f2",
                  bgcolor: "#fff8f0",
                  borderRadius: 1,
                  boxShadow: "0 0 8px #1da1f280",
                }}
              >
                <TwitterIcon fontSize="large" />
              </IconButton>
            </Stack>

            <Typography
              textAlign="center"
              mt={4}
              color="#4a4a4a"
              fontWeight="500"
            >
              Already have an account?{" "}
              <MuiLink
                href="/login"
                underline="none"
                sx={{ fontWeight: "700", color: "#b22222" }}
              >
                Login
              </MuiLink>
            </Typography>
          </Stack>
        </form>

        <Snackbar
          open={openToast}
          autoHideDuration={3000}
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseToast}
            severity="success"
            sx={{ width: "100%" }}
          >
            Account created for: {name}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
