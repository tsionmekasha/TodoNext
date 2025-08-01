"use client";

import { useState } from "react";
import axios from "axios";
import { Dialog, IconButton, Box, Stack, TextField } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

export default function ChatbotButton({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Add greeting when popup opens
  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([
        { role: "bot", text: "Hello! 👋 How can I help you with your ToDo tasks today?" }
      ]);
    }
  };

  const handleAsk = async () => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("http://localhost:8080/api/chat", { query: message, user_id: userId });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <Box sx={{ position: "fixed", bottom: 0, right: 0, m: 3, zIndex: 1400 }}>
        <IconButton
          color="primary"
          size="large"
          sx={{ bgcolor: "#1976d2", color: "white", '&:hover': { bgcolor: "#1565c0" } }}
          onClick={handleOpen}
        >
          <ChatBubbleOutlineIcon fontSize="large" />
        </IconButton>
      </Box>
      {/* Chat dialog popup */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <Box p={0} sx={{ bgcolor: '#222', borderRadius: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #333', bgcolor: '#222', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <ChatBubbleOutlineIcon sx={{ color: '#43c988', mr: 1 }} />
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 18 }}>Chatbot</span>
          </Box>
          {/* Chat area */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              bgcolor: '#222',
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              minHeight: 320,
              maxHeight: 400,
              height: 400,
            }}
          >
            {/* Message bubbles */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                mb: 2,
              }}
            >
              {messages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.role === 'user' ? '#43c988' : '#343541',
                      color: '#fff',
                      borderRadius: 8,
                      p: 2,
                      fontSize: 15,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid #444',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      mb: 1,
                    }}
                  >
                    {msg.text}
                  </Box>
                </Box>
              ))}
            </Box>
            {/* Input area at bottom */}
            <Stack direction="row" sx={{ mt: 'auto' }}>
              <TextField
                className="w-full"
                placeholder="Type your message..."
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading && message.trim()) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                sx={{
                  bgcolor: "#fff8f0", // Ivory Cream
                  input: { color: "#4a4a4a" }, // Dark Warm Gray
                  borderRadius: 3,}}
              />
              <button
                className=""
                onClick={handleAsk}
                style={{
                  background: '#43c988',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 15px',
                  fontWeight: 600,
                  fontSize: 16,
                  marginTop: 4,
                  marginLeft: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s',
                }}
                disabled={loading || !message.trim()}
              >
                {loading ? 'Thinking...' : 'Send'}
              </button>
            </Stack>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
