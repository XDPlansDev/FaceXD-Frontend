// 📄 /pages/feed.js

import { useState, useEffect } from "react";
import {
  List, ListItem, ListItemAvatar, Avatar, ListItemText, TextField, Button,
  Card, CardContent, IconButton, Typography, Divider
} from "@mui/material";
import { Favorite, Comment } from "@mui/icons-material";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Carrega os posts
  useEffect(() => {
    console.log("🟡 CONSULTANDO POSTS...");
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("🟢 POSTS RECEBIDOS:", data);
      setPosts(data || []);
    } catch (err) {
      console.error("🔴 ERRO AO CONSULTAR POSTS:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📬 Cria um novo post
  const handleCreatePost = async () => {
    console.log("📨 ENVIANDO NOVO POST:", content);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const newPost = await res.json();
        console.log("✅ POST CRIADO:", newPost);
        setPosts([newPost, ...posts]);
        setContent("");
      } else {
        const error = await res.json();
        console.error("🔴 ERRO AO CRIAR POST:", error);
      }
    } catch (err) {
      console.error("🔴 ERRO AO CRIAR POST:", err);
    }
  };

  // ❤️ Curtir um post
  const handleLike = async (postId) => {
    console.log("❤️ CURTINDO POST:", postId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        console.log("🔁 POST ATUALIZADO COM LIKE:", updated);
        setPosts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      } else {
        const error = await res.json();
        console.error("🔴 ERRO AO CURTIR POST:", error);
      }
    } catch (err) {
      console.error("🔴 ERRO AO CURTIR POST:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Feed
      </Typography>

      {/* Formulário para novo post */}
      <Card sx={{ mb: 4, p: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="O que você está pensando hoje?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          disabled={!content.trim()}
          onClick={handleCreatePost}
        >
          Publicar
        </Button>
      </Card>

      {/* Lista de posts */}
      {loading ? (
        <Typography color="text.secondary">Carregando...</Typography>
      ) : posts.length === 0 ? (
        <Typography>Nenhum post ainda. Seja o primeiro a publicar!</Typography>
      ) : (
        <List>
          {posts.map((post) => (
            <Card key={post._id} sx={{ mb: 3 }}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={post.userId?.avatar || "/profile-default.svg"} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold">
                      {post.userId?.nome || "Anônimo"}
                    </Typography>
                  }
                  secondary={
                    <Typography color="text.secondary">
                      {post.content}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider />
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton color="error" onClick={() => handleLike(post._id)}>
                  <Favorite />
                </IconButton>
                <Typography>{post.likes?.length || 0}</Typography>

                <IconButton disabled>
                  <Comment />
                </IconButton>
                <Typography>{post.comments?.length || 0}</Typography>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </div>
  );
}
