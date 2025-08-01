"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Box,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import ChatbotButton from "./ChatbotButton";

export default function Navbar() {
  const router = useRouter();

  // Simulated username, replace with actual user data later
  const [username, setUsername] = useState<string>("...");
  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) return;
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.name || "Profile");
        } else {
          setUsername("Profile");
        }
      } catch {
        setUsername("Profile");
      }
    };
    fetchProfile();
  }, []);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (path: string) => {
    handleCloseUserMenu();
    router.push(path);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    router.push("/login"); // redirect to login after logout
  };

  return (
    <AppBar position="static" sx={{ bgcolor: "#800020" /* Rich Burgundy */ }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          TaskNest
        </Typography>

        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChatbotButton userId={username} />
          <Tooltip title={username} arrow>
            <IconButton
              onClick={handleOpenUserMenu}
              sx={{ p: 0, color: "white" }}
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>

          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={() => handleMenuClick("/profile")}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
