import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth(); // Pega o usuário logado
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((err) => console.error("Erro ao buscar posts", err));
    }
  }, [user]);

  return (
    <div>
      <h1>Perfil de {user?.nome}</h1>
      <h2>Meus Posts</h2>
      <ul>
        {posts.map((post) => (
          <li key={post._id}>{post.content}</li>
        ))}
      </ul>
    </div>
  );
}
