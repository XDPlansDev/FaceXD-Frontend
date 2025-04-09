// 📁 Caminho: /pages/profile/[username].js

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
  Paper,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { username, tab: tabParam } = router.query;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdLogado, setUserIdLogado] = useState(null);
  const [tab, setTab] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!router.isReady || !username) return;

    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserIdLogado(storedUserId);
      console.log("👤 ID do usuário logado:", storedUserId);
    }

    fetchUserProfile();
    fetchUserPosts();

    if (tabParam === "posts") setTab(1);
  }, [router.isReady, username, tabParam]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/username/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        console.log("📦 Perfil carregado:", data);

        const idLogado = localStorage.getItem("userId");
        setIsOwnProfile(data._id === idLogado);

        const followersAsString = data.followers?.map((id) => id?.toString?.()) || [];
        const seguindo = followersAsString.includes(idLogado);
        console.log("👥 Já está seguindo?", seguindo);
        setIsFollowing(seguindo);
      } else {
        console.error("❌ Erro ao carregar perfil");
      }
    } catch (error) {
      console.error("❌ Erro na requisição de perfil", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/username/${username}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        console.log("📄 Posts carregados:", data);
      } else {
        console.error("❌ Erro ao carregar posts");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar posts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        console.log("✅ Curtida atualizada:", updated);
        setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        console.error("❌ Erro ao curtir/descurtir");
      }
    } catch (err) {
      console.error("❌ Erro ao curtir/descurtir:", err);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/users/follow/${user._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const updatedUser = await res.json();
        const updatedFollowers = updatedUser.followers?.map((id) => id?.toString?.()) || [];
        setUser((prev) => ({ ...prev, followers: updatedFollowers }));
        setIsFollowing(updatedFollowers.includes(userIdLogado));
        console.log("🔁 Status de seguir atualizado:", updatedUser);
      } else {
        console.error("❌ Erro ao seguir/deixar de seguir");
      }
    } catch (err) {
      console.error("❌ Erro no follow:", err);
    }
  };

  const calcularIdade = (dataNasc) => {
    if (!dataNasc) return null;
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
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

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="mt-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Card className="p-4 mb-4">
          <CardContent>
            <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
              <Avatar src={user?.avatar || "/profile-default.svg"} alt="Avatar" sx={{ width: 80, height: 80 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {user?.nome} {user?.sobrenome}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
                {user?.sexo && <Typography variant="body2" color="text.secondary">Sexo: {user.sexo}</Typography>}
                {user?.dataNascimento && (
                  <Typography variant="body2" color="text.secondary">
                    Nascimento: {formatarData(user.dataNascimento)}
                  </Typography>
                )}
              </Box>
              <Box display="flex" gap={2} ml="auto">
                <Paper elevation={2} sx={{ px: 2, py: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">👥 Seguidores</Typography>
                  <Typography variant="body1">{user?.followers?.length || 0}</Typography>
                </Paper>
                <Paper elevation={2} sx={{ px: 2, py: 1, textAlign: "center" }}>
                  <Typography variant="subtitle2">⭐ Favoritos</Typography>
                  <Typography variant="body1">
                    {posts.filter((p) => p.likes?.some((id) => id?.toString?.() === userIdLogado)).length}
                  </Typography>
                </Paper>
              </Box>
            </Box>
            {!isOwnProfile && (
              <Box mt={3} display="flex" gap={2}>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  color={isFollowing ? "secondary" : "primary"}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </Button>
                <Button variant="outlined">Mensagem</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Tabs
        value={tab}
        onChange={(e, newValue) => {
          setTab(newValue);
          const query = { ...router.query, tab: newValue === 1 ? "posts" : "sobre" };
          router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}
        centered
      >
        <Tab label="Sobre" />
        <Tab label="Posts" />
      </Tabs>

      {tab === 0 && (
        <Box mt={3}>
          <Typography variant="body1">
            {user?.bio || "Este usuário ainda não escreveu uma bio."}
          </Typography>
        </Box>
      )}

      {tab === 1 && (
        <Box mt={3}>
          {posts.length > 0 ? (
            posts.map((post) => {
              const jaCurtiu = post.likes?.some((id) => id?.toString?.() === userIdLogado);
              return (
                <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Card className="mb-4 shadow-sm rounded-xl">
                    <CardContent>
                      <Typography variant="body1" className="mb-2">
                        {post.content}
                      </Typography>
                      <Divider className="my-2" />
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          <IconButton size="small" onClick={() => handleLike(post._id)}>
                            {jaCurtiu ? <FavoriteIcon sx={{ color: "#e53935" }} /> : <FavoriteBorderIcon sx={{ color: "#999" }} />}
                          </IconButton>
                          <Typography variant="body2" color="text.secondary">
                            {post.likes?.length || 0} curtidas
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              Este usuário ainda não publicou nenhum post.
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}