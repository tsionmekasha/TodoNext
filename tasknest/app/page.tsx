"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Divider,
  Paper,
} from "@mui/material";

const colors = {
  primary: "#800020", // Rich Burgundy
  text: "#4a4a4a", // Dark Warm Gray
  background: "#fff8f0", // Ivory Cream
  link: "#b22222", // Deep Red
  accent: "#c4973f", // Gold Accent
};

export default function Home() {
  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        minHeight: "100vh",
        py: 8,
        px: 2,
        color: colors.text,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        {/* Header */}
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", color: colors.primary }}
        >
          Welcome to TaskNest
        </Typography>
        <Typography
          variant="h6"
          mb={6}
          sx={{ maxWidth: 600, mx: "auto", color: colors.text }}
        >
          Manage your tasks with simplicity and style. Stay organized and
          productive with TaskNest’s intuitive tools.
        </Typography>

        <Divider
          sx={{
            borderColor: colors.accent,
            width: 80,
            mx: "auto",
            mb: 6,
            borderBottomWidth: 3,
            borderRadius: 2,
          }}
        />

        {/* Features Section */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="space-around"
          mb={8}
        >
          {[
            {
              title: "Easy Task Management",
              description:
                "Create, edit, and organize your tasks quickly and efficiently.",
            },
            {
              title: "Seamless Collaboration",
              description:
                "Share tasks and projects with your team and stay in sync.",
            },
            {
              title: "Stay Notified",
              description:
                "Get timely reminders and never miss important deadlines.",
            },
          ].map(({ title, description }) => (
            <Paper
              key={title}
              elevation={3}
              sx={{
                p: 4,
                flex: 1,
                borderRadius: 3,
                backgroundColor: "#fff",
                color: colors.text,
                textAlign: "center",
                boxShadow: `0 0 10px ${colors.accent}66`,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: colors.link }}
              >
                {title}
              </Typography>
              <Typography variant="body1">{description}</Typography>
            </Paper>
          ))}
        </Stack>

        {/* Call to Action */}
        <Box sx={{ mb: 6 }}>
          <Button
            component={Link}
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: colors.primary,
              "&:hover": { backgroundColor: colors.link },
              px: 5,
            }}
          >
            Get Started Now
          </Button>
        </Box>

      </Container>
    </Box>
  );
}
