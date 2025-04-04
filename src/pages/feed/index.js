import { useState, useEffect } from "react";
import CreatePostForm from "@/components/CreatePostForm";
import PostCard from "@/components/PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Erro ao buscar posts");
      }
    } catch (error) {
      console.error("Erro ao carregar posts", error);
    }
  };

  const handleCreatePost = async (content) => {
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
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        console.log("Post efetuado com sucesso");
        const createdPost = await response.json();
        setPosts((prevPosts) => [createdPost, ...prevPosts]);
      } else {
        console.error("Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro ao enviar novo post", error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não autenticado");
        return;
      }

      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPosts(); // Atualiza os posts após curtir
      } else {
        const errorData = await response.json();
        console.error(errorData.message);
      }
    } catch (error) {
      console.error("Erro ao curtir post", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>

      {/* Formulário para criar post */}
      <CreatePostForm onCreate={handleCreatePost} placeholder="O que está pensando hoje?" />

      {/* Lista de posts */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={() => handleLikePost(post._id)} />
        ))
      ) : (
        <p className="text-gray-500">Nenhum post encontrado.</p>
      )}
    </div>
  );
}
