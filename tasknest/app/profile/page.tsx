"use client";

import { useState, ChangeEvent } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  Stack,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    avatarUrl: "",
    password: "",
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [tempData, setTempData] = useState({
    name: user.name,
    email: user.email,
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = (field: keyof typeof isEditing) => {
    if (isEditing[field]) {
      if (field === "password") {
        if (tempData.password.trim() !== "") {
          setUser((prev) => ({ ...prev, password: tempData.password }));
        }
      } else {
        setUser((prev) => ({ ...prev, [field]: tempData[field] }));
      }
    } else {
      setTempData((prev) => ({ ...prev, [field]: user[field] || "" }));
    }
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUser((prev) => ({ ...prev, avatarUrl: url }));
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff8f0", // Ivory Cream
        minHeight: "100vh",
        py: 8,
        px: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 6,
          maxWidth: 550,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(128, 0, 32, 0.3)",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            sx={{
              width: 120,
              height: 120,
              bgcolor: "#800020",
              fontSize: 48,
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {!user.avatarUrl && user.name.charAt(0)}
          </Avatar>

          <input
            accept="image/*"
            type="file"
            id="avatar-upload"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <Button
              variant="contained"
              component="span"
              size="small"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#c4973f",
                color: "#fff",
                "&:hover": { backgroundColor: "#a67c2a" },
                fontWeight: "600",
                textTransform: "none",
              }}
            >
              Change
            </Button>
          </label>
        </Box>

        {/* Editable fields with explicit labels */}

        <Stack spacing={4} maxWidth={400} mx="auto" textAlign="left">
          {/* Name */}
          <Box sx={{ position: "relative" }}>
            <Typography
              variant="subtitle2"
              color="#800020"
              fontWeight="700"
              mb={1}
            >
              Name
            </Typography>
            {isEditing.name ? (
              <TextField
                name="name"
                value={tempData.name}
                onChange={handleChange}
                fullWidth
                size="small"
                autoFocus
              />
            ) : (
              <Typography
                variant="h6"
                color="#4a4a4a"
                sx={{ lineHeight: 1.5 }}
              >
                {user.name}
              </Typography>
            )}
            <IconButton
              onClick={() => toggleEdit("name")}
              sx={{
                position: "absolute",
                right: 0,
                top: isEditing.name ? 8 : "50%",
                transform: isEditing.name ? "none" : "translateY(-50%)",
                color: "#b22222",
              }}
              aria-label={isEditing.name ? "Save Name" : "Edit Name"}
            >
              {isEditing.name ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>

          {/* Email */}
          <Box sx={{ position: "relative" }}>
            <Typography
              variant="subtitle2"
              color="#800020"
              fontWeight="700"
              mb={1}
            >
              Email
            </Typography>
            {isEditing.email ? (
              <TextField
                name="email"
                type="email"
                value={tempData.email}
                onChange={handleChange}
                fullWidth
                size="small"
                autoFocus
              />
            ) : (
              <Typography variant="body1" color="#4a4a4a" sx={{ lineHeight: 1.5 }}>
                {user.email}
              </Typography>
            )}
            <IconButton
              onClick={() => toggleEdit("email")}
              sx={{
                position: "absolute",
                right: 0,
                top: isEditing.email ? 8 : "50%",
                transform: isEditing.email ? "none" : "translateY(-50%)",
                color: "#b22222",
              }}
              aria-label={isEditing.email ? "Save Email" : "Edit Email"}
            >
              {isEditing.email ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>

          {/* Password */}
          <Box sx={{ position: "relative" }}>
            <Typography
              variant="subtitle2"
              color="#800020"
              fontWeight="700"
              mb={1}
            >
              Password
            </Typography>
            {isEditing.password ? (
              <TextField
                name="password"
                type="password"
                value={tempData.password}
                onChange={handleChange}
                fullWidth
                size="small"
                autoFocus
                helperText="Leave blank to keep current password"
              />
            ) : (
              <Typography
                variant="body1"
                color="#4a4a4a"
                sx={{ fontStyle: "italic", lineHeight: 1.5 }}
              >
                ******** (hidden)
              </Typography>
            )}
            <IconButton
              onClick={() => toggleEdit("password")}
              sx={{
                position: "absolute",
                right: 0,
                top: isEditing.password ? 8 : "50%",
                transform: isEditing.password ? "none" : "translateY(-50%)",
                color: "#b22222",
              }}
              aria-label={isEditing.password ? "Save Password" : "Edit Password"}
            >
              {isEditing.password ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Box>
        </Stack>

        <Button
          variant="contained"
          sx={{
            mt: 6,
            backgroundColor: "#800020",
            color: "#fff",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#4b0013" },
            textTransform: "none",
          }}
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}
