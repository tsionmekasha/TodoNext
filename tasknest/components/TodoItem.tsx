"use client";

import { useState } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface TodoItemProps {
  task: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (newTask: string) => void;
}

export default function TodoItem({
  task,
  completed,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task);

  const handleSave = () => {
    if (editValue.trim() !== "") {
      onEdit(editValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bgcolor="#fff8f0"
      p={2}
      mt={2}
      borderRadius={2}
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
    >
      <Box display="flex" alignItems="center" flexGrow={1}>
        <Checkbox checked={completed} onChange={onToggle} />
        {isEditing ? (
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            fullWidth
            autoFocus
            sx={{ ml: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditValue(task);
              }
            }}
          />
        ) : (
          <Typography
            sx={{
              textDecoration: completed ? "line-through" : "none",
              color: "#4a4a4a", // Dark Warm Gray
              fontWeight: 500,
              ml: 1,
              wordBreak: "break-word",
            }}
          >
            {task}
          </Typography>
        )}
      </Box>

      <Box>
        {isEditing ? (
          <IconButton
            aria-label="save"
            onClick={handleSave}
            sx={{ color: "#800020" }}
          >
            <SaveIcon />
          </IconButton>
        ) : (
          <IconButton
            aria-label="edit"
            onClick={() => setIsEditing(true)}
            sx={{ color: "#800020" }}
          >
            <EditIcon />
          </IconButton>
        )}

        <IconButton
          aria-label="delete"
          onClick={onDelete}
          sx={{ color: "#b22222" }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
