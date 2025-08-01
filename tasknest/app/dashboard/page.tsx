"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Navbar from "@/components/Navbar";
import TodoForm from "@/components/TodoForm";
import TodoItem from "@/components/TodoItem";
import ChatbotButton from "@/components/ChatbotButton";

interface Todo {
  _id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  completed?: boolean; // Added completed field
}

export default function DashboardPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editToastOpen, setEditToastOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(""); // id of todo being edited
  const [deleteLoading, setDeleteLoading] = useState(""); // id of todo being deleted
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  // Auth check and fetch todos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTodos(token);
    // eslint-disable-next-line
  }, []);

  const fetchTodos = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        else setError("Failed to fetch todos");
        setTodos([]);
        return;
      }
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError("Network error");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setAddLoading(true);
    setError("");
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setTodos((prev) => [data, ...prev]);
      } else {
        setError(data.error || "Failed to add todo");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setAddLoading(false);
    }
  };

  const editTodo = async (id: string, newTitle: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setEditLoading(id);
    setError("");
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (res.status === 200) {
        setTodos((prev) => prev.map((todo) => (todo._id === id ? data : todo)));
        setEditToastOpen(true);
      } else {
        setError(data.error || "Failed to update todo");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setEditLoading("");
    }
  };

  const deleteTodo = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setDeleteLoading(id);
    setError("");
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete todo");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setDeleteLoading("");
    }
  };

  const handleEditToastClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setEditToastOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (todoToDelete) {
      await deleteTodo(todoToDelete);
      setTodoToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTodoToDelete(null);
  };

  // Toggle completed state in backend and update UI
  const toggleTodoCompleted = async (id: string) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    // Optimistically update UI
    setTodos((prev) => prev.map((t) => t._id === id ? { ...t, completed: !t.completed } : t));
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) {
        // Revert UI if error
        setTodos((prev) => prev.map((t) => t._id === id ? { ...t, completed: todo.completed } : t));
        const data = await res.json();
        setError(data.error || "Failed to update todo");
      }
    } catch (err) {
      setTodos((prev) => prev.map((t) => t._id === id ? { ...t, completed: todo.completed } : t));
      setError("Network error");
    }
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

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : todos.length === 0 ? (
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
                    key={todo._id}
                    task={todo.title}
                    completed={!!todo.completed}
                    onToggle={() => toggleTodoCompleted(todo._id)}
                    onDelete={() => handleDeleteClick(todo._id)}
                    onEdit={(newTask) => editTodo(todo._id, newTask)}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Container>
        {/* Chatbot button fixed at bottom right */}
        <Box
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300,
          }}
        >
          <ChatbotButton />
        </Box>
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

      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={!!todoToDelete}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this todo? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
       
    </>
  );
}
