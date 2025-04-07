// Caminho: /components/CreatePostForm.js

import { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Avatar,
  Box,
} from "@mui/material";

export default function CreatePostForm({ onCreate, user }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed) {
      onCreate({ title: "", content: trimmed });
      setContent("");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box display="flex" alignItems="flex-start">
          {/* Avatar opcional */}
          {user?.avatar && (
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            />
          )}
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            variant="outlined"
            placeholder="O que está pensando hoje?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
              },
            }}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!content.trim()}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Publicar
          </Button>
        </Box>
      </form>
    </Paper>
  );
}
