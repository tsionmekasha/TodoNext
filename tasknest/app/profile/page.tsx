"use client";

import React, { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  TextField,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useRouter } from "next/navigation";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

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

  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Not authenticated", severity: "error" });
      return;
    }
    fetch("/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          setSnackbar({ open: true, message: data.error || "Failed to fetch profile", severity: "error" });
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser((prev) => ({ ...prev, name: data.name, email: data.email }));
          setTempData((prev) => ({ ...prev, name: data.name, email: data.email }));
        }
      })
      .catch(() => {
        setSnackbar({ open: true, message: "Network error", severity: "error" });
      });
  }, []);

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

  const handleOpenChangePassword = () => {
    setOpenChangePasswordDialog(true);
    setCurrentPassword("");
    setNewPassword("");
  };
  const handleCloseChangePassword = () => {
    setOpenChangePasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
  };
  // Save name to backend
  const handleSaveName = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Not authenticated", severity: "error" });
      return;
    }
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: tempData.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, name: tempData.name }));
        setIsEditing((prev) => ({ ...prev, name: false }));
        setSnackbar({ open: true, message: "Name updated successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to update name", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    }
  };

  // Save password to backend
  const handleSaveChangePassword = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({ open: true, message: "Not authenticated", severity: "error" });
      return;
    }
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setOpenChangePasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setSnackbar({ open: true, message: "Password changed successfully!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: data.error || "Failed to change password", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Network error", severity: "error" });
    }
  };

  // Handle Enter key for name field
  const handleNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveName();
    }
  };

  // Snackbar close handler
  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
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
                onKeyDown={handleNameKeyDown}
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
              onClick={isEditing.name ? handleSaveName : () => toggleEdit("name")}
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

          {/* Email (plain text, no edit icon) */}
          <Box>
            <Typography
              variant="subtitle2"
              color="#800020"
              fontWeight="700"
              mb={1}
            >
              Email
            </Typography>
            <Typography variant="body1" color="#4a4a4a" sx={{ lineHeight: 1.5 }}>
              {user.email}
            </Typography>
          </Box>
        </Stack>

        {/* Buttons: Change Password and Back to Dashboard */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={6}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#800020",
              color: "#fff",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#4b0013" },
              textTransform: "none",
            }}
            onClick={handleOpenChangePassword}
          >
            Change Password
          </Button>
          <Button
            variant="contained"
            sx={{
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
        </Stack>

        {/* Change Password Dialog */}
        <Dialog open={openChangePasswordDialog} onClose={handleCloseChangePassword}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
            <Stack spacing={3} mt={1}>
              <TextField
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                fullWidth
                autoFocus
              />
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseChangePassword} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleSaveChangePassword}
              variant="contained"
              sx={{
                backgroundColor: "#800020",
                color: "#fff",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#4b0013" },
                textTransform: "none",
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
