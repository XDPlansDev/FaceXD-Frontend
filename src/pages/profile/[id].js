// Caminho: /pages/profile/[id].js

// 📌 Importações necessárias
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Avatar, Button, Card, CardContent, Typography, Container, CircularProgress } from "@mui/material";
import PostCard from "@/components/PostCard"; // Componente para exibir posts

// 📌 Componente da Página de Perfil do Usuário
export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query; // Pegamos o ID do usuário na URL

  // Estados para armazenar informações do usuário e seus posts
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para exibir "Carregando..."

  // 🚀 Efeito que roda quando a página carrega ou quando o ID do usuário muda
  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [id]);

  // 📝 Função para buscar os dados do usuário na API
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

  // 📝 Função para buscar os posts do usuário na API
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
    } finally {
      setLoading(false); // Esconde o "Carregando..." após carregar os dados
    }
  };

  // 📌 Se os dados ainda estiverem carregando, mostramos um indicador de progresso
  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }

  // 📌 Estrutura visual da página de perfil
  return (
    <Container maxWidth="md" className="mt-6">
      {/* 📌 Cartão com informações do usuário */}
      <Card className="p-4 mb-6">
        <CardContent className="flex items-center">
          <Avatar src={user?.avatar || "/default-avatar.png"} sx={{ width: 80, height: 80, marginRight: 2 }} />
          <div>
            <Typography variant="h5" className="font-bold">{user?.name}</Typography>
            <Typography variant="body2" className="text-gray-600">{user?.bio || "Este usuário ainda não escreveu uma bio."}</Typography>
            {/* 📌 Botão para editar perfil (Pode ser implementado futuramente) */}
            <Button variant="outlined" color="primary" className="mt-2">Editar Perfil</Button>
          </div>
        </CardContent>
      </Card>

      {/* 📌 Seção de posts do usuário */}
      <Typography variant="h6" className="font-bold mb-4">Posts</Typography>
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post._id} post={post} onLike={() => {}} />)
      ) : (
        <Typography variant="body2" className="text-gray-500">Este usuário ainda não publicou nenhum post.</Typography>
      )}
    </Container>
  );
}
