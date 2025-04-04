import { useState, useEffect } from "react";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, TextField, Button, Card, CardContent, IconButton, Typography } from "@mui/material";
import { Favorite } from "@mui/icons-material";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.length === 0 ? [fakePost] : data);
      } else {
        console.error("Erro ao buscar posts:", response.statusText);
        setPosts([fakePost]);
      }
    } catch (error) {
      console.error("Erro ao carregar posts", error);
      setPosts([fakePost]);
    }
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts((prevPosts) => [createdPost, ...prevPosts]);
        setContent("");
      } else {
        console.error("Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro ao enviar novo post", error);
    }
  };

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      )
    );
  };

  const fakePost = {
    _id: "fake-post",
    user: {
      name: "Usuário Exemplo",
      avatar: "https://via.placeholder.com/50",
    },
    content: "Este é um post de exemplo. Quando os posts reais forem carregados, ele desaparecerá.",
    likes: 0,
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>

      {/* Formulário para criar post */}
      <Card sx={{ mb: 4, p: 2 }}>
        <TextField
          fullWidth
          multiline
          variant="outlined"
          label="O que você está pensando hoje?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleCreatePost}
        >
          Publicar
        </Button>
      </Card>

      {/* Lista de posts */}
      <List>
        {posts.map((post) => (
          <Card key={post._id} sx={{ mb: 2, p: 2 }}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={post.user?.avatar || "https://via.placeholder.com/50"} />
              </ListItemAvatar>
              <ListItemText primary={post.user?.name || "Anônimo"} secondary={post.content} />
            </ListItem>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="error" onClick={() => handleLike(post._id)}>
                <Favorite />
              </IconButton>
              <Typography variant="body2">{post.likes || 0}</Typography>
            </CardContent>
          </Card>
        ))}
      </List>
    </div>
  );
}
