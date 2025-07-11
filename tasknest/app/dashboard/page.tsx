"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editToastOpen, setEditToastOpen] = useState(false);

  const addTodo = (task: string) => {
    const newTodo: Todo = {
      id: Date.now(),
      task,
      completed: false,
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const handleEdit = (id: number, newTask: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, task: newTask } : todo))
    );
    setEditToastOpen(true);
  };

  const handleEditToastClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setEditToastOpen(false);
  };

  return (
    <>
      <Navbar />
      <Box bgcolor="#fff8f0" minHeight="100vh" py={6}>
        <Container maxWidth="md">
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              color="#800020"
              gutterBottom
            >
              Welcome Back!
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="#4a4a4a"
              mb={4}
            >
              Manage your daily tasks below
            </Typography>

            <TodoForm onAdd={addTodo} />

            <Divider sx={{ my: 4 }} />

            {todos.length === 0 ? (
              <Typography
                variant="body1"
                align="center"
                color="#4a4a4a"
                fontStyle="italic"
              >
                You have no tasks yet. Start by adding one!
              </Typography>
            ) : (
              <Stack spacing={2}>
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    task={todo.task}
                    completed={todo.completed}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onEdit={(newTask) => handleEdit(todo.id, newTask)}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>

      {/* Snackbar for edit confirmation */}
      <Snackbar
        open={editToastOpen}
        autoHideDuration={3000}
        onClose={handleEditToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleEditToastClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Task updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
