// 📄 Caminho: /pages/profile/[username].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdLogado, setUserIdLogado] = useState(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!router.isReady || !username) return;

    // Pega o ID do usuário logado do localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserIdLogado(storedUserId.toString());
      console.log("👤 userId logado:", storedUserId);
    }

    fetchUserProfile();
    fetchUserPosts();
  }, [router.isReady, username]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error("❌ Erro ao carregar perfil");
      }
    } catch (error) {
      console.error("❌ Erro na requisição de perfil", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/posts/username/${username}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error("❌ Erro ao carregar posts do usuário");
      }
    } catch (error) {
      console.error("❌ Erro na requisição de posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedPost = await response.json();
        console.log("✅ Curtida atualizada com sucesso:", updatedPost);

        // Atualiza o estado com o post curtido/desc
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            console.log("🌀 Comparando post:", p._id, "==", updatedPost._id);
            return p._id === updatedPost._id ? updatedPost : p;
          })
        );
      } else {
        console.error("❌ Erro ao curtir/descurtir post");
      }
    } catch (error) {
      console.error("❌ Erro ao curtir/descurtir post:", error);
    }
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }

  const avatarUrl = user?.avatar?.trim() ? user.avatar : "/profile-default.svg";

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return null;
    const nascimento = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "Data não informada";
    const data = new Date(dataISO);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();
    const idade = calcularIdade(dataISO);
    return `${dia}/${mes}/${ano} (${idade} anos)`;
  };

  return (
    <Container maxWidth="md" className="mt-6">
      <Card className="p-4 mb-6">
        <CardContent className="flex items-center">
          <Avatar
            src={avatarUrl}
            alt={`${user?.nome || "Usuário"} ${user?.sobrenome || ""}`}
            sx={{ width: 80, height: 80, marginRight: 2 }}
          />
          <div>
            <Typography variant="h5" className="font-bold">
              {user?.nome && user?.sobrenome
                ? `${user.nome} ${user.sobrenome}`
                : "Usuário sem nome"}
            </Typography>

            {user?.sexo && (
              <Typography variant="body2" className="text-gray-600">
                Sexo: {user.sexo}
              </Typography>
            )}

            {user?.dataNascimento && (
              <Typography variant="body2" className="text-gray-600">
                Nascimento: {formatarData(user.dataNascimento)}
              </Typography>
            )}

            <Typography variant="body2" className="text-gray-600 mt-1">
              {user?.bio || "Este usuário ainda não escreveu uma bio."}
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Typography variant="h6" className="font-bold mb-4">
        Posts
      </Typography>

      {posts.length > 0 ? (
        posts.map((post) => {
          // 🧠 Verifica se o usuário logado já curtiu o post
          const jaCurtiu = post.likes?.some((id) => {
            const idStr =
              typeof id === "object" && id._id ? id._id.toString() : id?.toString();
            return idStr === userIdLogado;
          });

          return (
            <Card key={post._id} className="mb-4 shadow-md rounded-2xl">
              <CardContent>
                <Typography variant="body1" className="mb-2">
                  {post.content}
                </Typography>

                <Divider className="my-2" />

                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        console.log("🔘 Curtindo post:", post._id);
                        handleLike(post._id);
                      }}
                    >
                      {jaCurtiu ? (
                        <FavoriteIcon sx={{ color: "#e53935" }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ color: "#999" }} />
                      )}
                    </IconButton>
                    <Typography variant="body2" color="textSecondary">
                      {post.likes?.length || 0} curtidas
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Typography variant="body2" className="text-gray-500">
          Este usuário ainda não publicou nenhum post.
        </Typography>
      )}
    </Container>
  );
}
