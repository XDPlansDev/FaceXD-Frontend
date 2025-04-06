// Caminho: /pages/profile/[username].js
// --------------------------------------------------------------
// Explicação Geral:
// 1. Exibimos o "nome + sobrenome" do usuário, ao invés de "username".
// 2. Incluímos um Modal (usando o componente Dialog do Material UI) que 
//    contém o formulário de edição de perfil. Ao clicar no botão "Editar Perfil",
//    o modal é aberto, permitindo edição dentro da mesma página.
// 3. Mantemos as requisições ao backend usando a variável de ambiente 
//    NEXT_PUBLIC_API_URL, que no seu .env.local pode ser, por exemplo:
//       NEXT_PUBLIC_API_URL=http://localhost:5000
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import PostCard from "@/components/PostCard"; // Componente que exibe cada post

export default function ProfilePage() {
  // 1. Pega o objeto "router" do Next.js
  const router = useRouter();
  
  // 2. Extrai o "username" da rota dinâmica [username].js
  const { username } = router.query;
  
  // 3. Estados para armazenar informações do usuário e seus posts
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 4. Estado para controlar a abertura/fechamento do Modal de edição
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // 5. Captura a variável de ambiente com a URL base do backend
  //    Definida no arquivo .env.local como, por exemplo:
  //    NEXT_PUBLIC_API_URL=http://localhost:5000
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // 6. useEffect que roda sempre que o "username" for definido (ou mudar)
  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [username]);
  
  // 7. Função para buscar os dados do usuário no backend, usando o "username"
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/username/${username}`);
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
  
  // 8. Função para buscar os posts do usuário no backend, usando o "username"
  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/posts/username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("Erro ao carregar posts do usuário");
      }
    } catch (error) {
      console.error("Erro na requisição de posts", error);
    } finally {
      setLoading(false);
    }
  };
  
  // 9. Enquanto estiver carregando, exibimos um indicador de progresso
  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }
  
  // 10. Funções para abrir/fechar o Modal de edição
  const handleOpenEditModal = () => {
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };
  
  // 11. Se já temos os dados do usuário e dos posts, renderizamos a página
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
            {/* Exibindo Nome + Sobrenome ao invés de username */}
            <Typography variant="h5" className="font-bold">
              {user?.nome && user?.sobrenome
                ? `${user.nome} ${user.sobrenome}`
                : "Usuário sem nome"}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {user?.bio || "Este usuário ainda não escreveu uma bio."}
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              className="mt-2"
              onClick={handleOpenEditModal}
            >
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

      {/* Modal (Dialog) para edição do perfil */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          {/* Aqui você pode reutilizar o mesmo formulário do /pages/profile/edit.js
              ou criar um componente próprio para edição. Para exemplo, vamos
              importar diretamente o EditProfileForm abaixo. */}
          <EditProfileForm onClose={handleCloseEditModal} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// -------------------------------------------------------------
// Exemplo de formulário de edição em um componente interno
// (você poderia importar de /pages/profile/edit ou de /components/EditProfileForm.js)
// -------------------------------------------------------------
function EditProfileForm({ onClose }) {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(true);
  
  // Pegamos a URL base do .env.local
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNome(data.nome);
          setSobrenome(data.sobrenome);
          setEmail(data.email);
        } else {
          alert("Erro ao carregar perfil");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil", error);
      } finally {
        setCarregando(false);
      }
    };
    
    fetchProfile();
  }, [BASE_URL]);
  
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome, sobrenome, email })
      });
      
      if (response.ok) {
        alert("Perfil atualizado com sucesso!");
        onClose(); // Fecha o modal após salvar
      } else {
        alert("Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
    }
  };
  
  if (carregando) {
    return <p>Carregando...</p>;
  }
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ padding: "0.5rem" }}
      />
      <input
        type="text"
        placeholder="Sobrenome"
        value={sobrenome}
        onChange={(e) => setSobrenome(e.target.value)}
        style={{ padding: "0.5rem" }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.5rem" }}
      />

      <Button variant="contained" color="primary" onClick={handleSave}>
        Salvar
      </Button>
    </div>
  );
}