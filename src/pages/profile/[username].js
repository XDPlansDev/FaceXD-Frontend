// Caminho: /pages/profile/[username].js
// --------------------------------------------------------------
// Explicação Geral:
// 1. Renomeamos o arquivo de rota dinâmica de [id].js para [username].js 
//    para que a URL fique no formato: /profile/nomedeusuario
// 2. No código abaixo, usamos router.query.username para capturar o "username"
//    da URL, e fazemos requisições ao backend usando esse valor.
// 3. Ajustamos as funções fetchUserProfile e fetchUserPosts para buscar os 
//    dados do usuário e posts pelo "username" (e não pelo ID).
// 4. No backend, precisamos ter endpoints que aceitem o username como parâmetro 
//    (ex: GET /api/users/username/:username e GET /api/posts/username/:username).
// --------------------------------------------------------------

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress
} from "@mui/material";
import PostCard from "@/components/PostCard"; // Componente que exibe cada post

export default function ProfilePage() {
  // 1. Pega o objeto "router" do Next.js
  const router = useRouter();
  
  // 2. Extrai o "username" da rota dinâmica [username].js
  //    Exemplo de URL: /profile/davidxavier => router.query.username = "davidxavier"
  const { username } = router.query;
  
  // 3. Estados para armazenar informações do usuário e seus posts
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 4. useEffect que roda sempre que o "username" for definido (ou mudar)
  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [username]);
  
  // 5. Função para buscar os dados do usuário no backend, usando o "username"
  const fetchUserProfile = async () => {
    try {
      // Substitua a URL abaixo pela rota correta do seu backend,
      // por exemplo: /api/users/username/:username
      const response = await fetch(`http://localhost:5000/api/users/username/${username}`);
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
  
  // 6. Função para buscar os posts do usuário no backend, usando o "username"
  const fetchUserPosts = async () => {
    try {
      // Substitua a URL abaixo pela rota correta do seu backend,
      // por exemplo: /api/posts/username/:username
      const response = await fetch(`http://localhost:5000/api/posts/username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Erro ao carregar posts do usuário");
      }
    } catch (error) {
      console.error("Erro na requisição de posts", error);
    } finally {
      // Independente de dar certo ou errado, paramos de exibir o "Carregando..."
      setLoading(false);
    }
  };
  
  // 7. Enquanto estiver carregando, exibimos um indicador de progresso
  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }
  
  // 8. Se já temos os dados do usuário e dos posts, renderizamos a página
  return (
    <Container maxWidth="md" className="mt-6">
      {/* Cartão com informações do usuário */}
      <Card className="p-4 mb-6">
        <CardContent className="flex items-center">
          <Avatar 
            src={user?.avatar || "/default-avatar.png"} 
            sx={{ width: 80, height: 80, marginRight: 2 }} 
          />
          <div>
            {/* user?.username ou user?.name dependendo de como seu backend retorna os dados */}
            <Typography variant="h5" className="font-bold">
              {user?.username || "Usuário sem nome"}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {user?.bio || "Este usuário ainda não escreveu uma bio."}
            </Typography>
            <Button variant="outlined" color="primary" className="mt-2">
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seção de posts do usuário */}
      <Typography variant="h6" className="font-bold mb-4">
        Posts
      </Typography>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={() => {}} />
        ))
      ) : (
        <Typography variant="body2" className="text-gray-500">
          Este usuário ainda não publicou nenhum post.
        </Typography>
      )}
    </Container>
  );
}