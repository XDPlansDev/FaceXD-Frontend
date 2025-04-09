// 📄 Caminho: /pages/profile/[username].js

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, Avatar, Divider, Typography, Tabs, Button, Spin, message, Row, Col, Space } from "antd";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { TabPane } = Tabs;

export default function ProfilePage() {
  const router = useRouter();
  const { username, tab: tabParam } = router.query;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userIdLogado, setUserIdLogado] = useState(null);
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
  }, [router.isReady, username]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/username/${username}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const idLogado = localStorage.getItem("userId");
        setIsOwnProfile(data._id === idLogado);
        setIsFollowing(data.followers?.includes(idLogado));
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/username/${username}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
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
      console.error("Erro ao curtir post:", err);
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
      const updatedUser = await res.json();
      const updatedFollowers = updatedUser.followers?.map((id) => id?.toString?.()) || [];
      setUser((prev) => ({ ...prev, followers: updatedFollowers }));
      setIsFollowing(updatedFollowers.includes(userIdLogado));
    } catch (err) {
      message.error("Erro ao seguir usuário.");
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
    return `${data.toLocaleDateString("pt-BR")} (${calcularIdade(dataISO)} anos)`;
  };

  if (loading) {
    return <Spin fullscreen tip="Carregando perfil..." />;
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card>
          <Row gutter={[24, 16]} align="middle">
            <Col>
              <Avatar size={80} src={user?.avatar || "/profile-default.svg"} />
            </Col>
            <Col flex="auto">
              <Typography.Title level={4}>{user?.nome} {user?.sobrenome}</Typography.Title>
              <Typography.Text type="secondary">@{user?.username}</Typography.Text>
              <br />
              {user?.sexo && <Typography.Text>Sexo: {user.sexo}</Typography.Text>}<br />
              {user?.dataNascimento && <Typography.Text>Nascimento: {formatarData(user.dataNascimento)}</Typography.Text>}
            </Col>
            <Col>
              <Space direction="vertical">
                <div>
                  <strong>👥 Seguidores:</strong> {user?.followers?.length || 0}
                </div>
                <div>
                  <strong>⭐ Favoritos:</strong> {posts.filter((p) => p.likes?.includes(userIdLogado)).length}
                </div>
              </Space>
              {!isOwnProfile && (
                <div style={{ marginTop: 12 }}>
                  <Button
                    type={isFollowing ? "default" : "primary"}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card>
      </motion.div>

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
