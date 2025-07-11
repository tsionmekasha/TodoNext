"use client";

import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function TodoForm({ onAdd }: { onAdd: (task: string) => void }) {
  const [task, setTask] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onAdd(task.trim());
      setTask("");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} mt={4}>
      <Stack direction="row" spacing={2}>
        <TextField
          variant="outlined"
          placeholder="Add a new task..."
          fullWidth
          value={task}
          onChange={(e) => setTask(e.target.value)}
          sx={{
            bgcolor: "#fff8f0", // Ivory Cream
            input: { color: "#4a4a4a" }, // Dark Warm Gray
          }}
        />
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "#800020", // Rich Burgundy
            color: "#fff8f0",
            "&:hover": { backgroundColor: "#4b0013" },
          }}
        >
          <AddIcon />
        </Button>
      </Stack>
    </Box>
  );
}
