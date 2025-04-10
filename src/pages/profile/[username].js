import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, Typography, Divider, Tabs, Button, Spin, Row, Space } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import CardPerfil from "./CardPerfil";

const { TabPane } = Tabs;

export default function ProfilePage() {
  const router = useRouter();
  const { username, tab: tabParam } = router.query;

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
        setIsOwnProfile(data._id === idLogado);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
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

  if (loading) return <Spin fullscreen tip="Carregando perfil..." />;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      {/* Componente de cabeçalho do perfil */}
      <CardPerfil
        user={user}
        userIdLogado={userIdLogado}
        isOwnProfile={isOwnProfile}
        BASE_URL={BASE_URL}
        setUser={setUser}
      />

      {/* Abas de conteúdo */}
      <Tabs defaultActiveKey={tabParam === "posts" ? "2" : "1"} style={{ marginTop: 24 }}>
        <TabPane tab="Sobre" key="1">
          <Typography.Paragraph>
            {user?.bio || "Este usuário ainda não escreveu uma bio."}
          </Typography.Paragraph>
        </TabPane>

        <TabPane tab="Posts" key="2">
          {posts.length > 0 ? (
            posts.map((post) => {
              const jaCurtiu = post.likes?.includes(userIdLogado);
              return (
                <motion.div key={post._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Card style={{ marginBottom: 16 }}>
                    <Typography.Text>{post.content}</Typography.Text>
                    <Divider />
                    <Row justify="space-between">
                      <Space>
                        <Button
                          type="text"
                          icon={jaCurtiu ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                          onClick={() => handleLike(post._id)}
                        />
                        <Typography.Text>{post.likes?.length || 0} curtidas</Typography.Text>
                      </Space>
                      <Typography.Text type="secondary">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </Typography.Text>
                    </Row>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <Typography.Text type="secondary">Este usuário ainda não publicou nenhum post.</Typography.Text>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
}
