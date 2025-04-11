import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Spinner,
  Flex,
  HStack,
  VStack,
  useToast
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { motion } from "framer-motion";
import CardPerfil from "./CardPerfil";

export default function ProfilePage() {
  const router = useRouter();
  const { username, tab: tabParam } = router.query;
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdLogado, setUserIdLogado] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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
  }, [router.isReady, username]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/username/${username}`);
      if (res.ok) {
        const data = await res.json();
        console.log("📄 Dados do usuário carregados:", data);

        setUser(data);
        const idLogado = localStorage.getItem("userId");
        if (idLogado) {
          setIsOwnProfile(data._id === idLogado);
        } else {
          setIsOwnProfile(false);
        }

        // Buscar contagem de favoritos
        fetchFavoritosCount(data._id);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
    }
  };

  const fetchFavoritosCount = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        console.log("⭐ Dados de favoritos carregados:", userData);

        setUser(prev => ({
          ...prev,
          favoritosCount: userData.favoritos?.length || 0
        }));
      }
    } catch (err) {
      console.error("❌ Erro ao buscar contagem de favoritos:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/username/${username}`);
      const data = await res.json();
      console.log("📝 Posts carregados:", data);

      // Conta de favoritos (posts curtidos pelo logado)
      const favoritos = data.filter((post) => post.likes?.includes(userIdLogado)).length;
      setUser((prev) => ({ ...prev, favoritosCount: favoritos }));
      setPosts(data);
    } catch (err) {
      console.error("❌ Erro ao buscar posts:", err);
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
        setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      }
    } catch (err) {
      console.error("❌ Erro ao curtir post:", err);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="xl">Usuário não encontrado</Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" p={4}>
      <CardPerfil user={user} isOwnProfile={isOwnProfile} />

      <Box mt={8}>
        <Tabs defaultIndex={tabParam === "favoritos" ? 1 : 0} onChange={(index) => {
          router.push(`/profile/${username}?tab=${index === 1 ? "favoritos" : "posts"}`);
        }}>
          <TabList>
            <Tab>Posts</Tab>
            <Tab>Favoritos</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Box
                      key={post._id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      boxShadow="sm"
                    >
                      <Text>{post.content}</Text>
                      <HStack mt={2} spacing={4}>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={post.likes?.includes(userIdLogado) ? <FaHeart color="red" /> : <FaRegHeart />}
                          onClick={() => handleLike(post._id)}
                        >
                          {post.likes?.length || 0}
                        </Button>
                      </HStack>
                    </Box>
                  ))
                ) : (
                  <Text textAlign="center" color="gray.500">Nenhum post encontrado</Text>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                {posts.filter(post => post.likes?.includes(userIdLogado)).length > 0 ? (
                  posts
                    .filter(post => post.likes?.includes(userIdLogado))
                    .map((post) => (
                      <Box
                        key={post._id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Text>{post.content}</Text>
                        <HStack mt={2} spacing={4}>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<FaHeart color="red" />}
                            onClick={() => handleLike(post._id)}
                          >
                            {post.likes?.length || 0}
                          </Button>
                        </HStack>
                      </Box>
                    ))
                ) : (
                  <Text textAlign="center" color="gray.500">Nenhum favorito encontrado</Text>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
