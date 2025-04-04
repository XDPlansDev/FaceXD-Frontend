// Caminho: /pages/profile/[id].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PostCard from "@/components/PostCard";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("Erro ao carregar perfil");
      }
    } catch (error) {
      console.error("Erro na requisição de perfil", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/user/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Erro ao carregar posts do usuário");
      }
    } catch (error) {
      console.error("Erro na requisição de posts", error);
    }
  };

  if (!user) return <p className="text-center">Carregando...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{user.name}</h1>
      <p className="text-gray-600">{user.bio || "Este usuário ainda não escreveu uma bio."}</p>
      <h2 className="text-xl font-bold mt-6">Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post._id} post={post} onLike={() => {}} />)
      ) : (
        <p className="text-gray-500">Este usuário ainda não publicou nenhum post.</p>
      )}
    </div>
  );
}
