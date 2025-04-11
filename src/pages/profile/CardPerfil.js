import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Row, Col, Space, Button, message } from "antd";
import { motion } from "framer-motion";
import { StarFilled, StarOutlined } from "@ant-design/icons";

const CardPerfil = ({ user, userIdLogado, BASE_URL, setUser, isOwnProfile }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔁 Verifica se o usuário logado já está seguindo o perfil
    useEffect(() => {
        if (!user || !userIdLogado) return;

        const seguindo = user.followers?.includes(userIdLogado);
        console.log("🔄 Verificando se usuário logado segue esse perfil:", seguindo);
        setIsFollowing(seguindo);
    }, [user, userIdLogado]);

    // ⭐ Verifica se o usuário já está favoritado
    useEffect(() => {
        if (!user || !userIdLogado) return;

        const checkIfFavorited = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BASE_URL}/api/users/${userIdLogado}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const currentUser = await res.json();
                    const favoritado = currentUser.favoritos?.includes(user._id);
                    console.log("⭐ Verificando se usuário está favoritado:", favoritado);
                    setIsFavorited(favoritado);
                }
            } catch (err) {
                console.error("❌ Erro ao verificar favoritos:", err);
            }
        };

        checkIfFavorited();
    }, [user, userIdLogado, BASE_URL]);

    // 👥 Alterna o estado de seguir/deixar de seguir
    const handleFollowToggle = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/api/users/${user._id}/follow`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("❌ Erro bruto na resposta:", text);
                throw new Error("Falha ao seguir/desseguir.");
            }

            const result = await res.json();
            console.log("🔁 Resultado da ação de seguir/desseguir:", result);

            // ✅ Atualiza o estado de seguidores visualmente
            setIsFollowing((prev) => !prev);

            setUser((prev) => {
                const alreadyFollowing = prev.followers?.includes(userIdLogado);
                const updatedFollowers = alreadyFollowing
                    ? prev.followers.filter((id) => id !== userIdLogado)
                    : [...(prev.followers || []), userIdLogado];

                console.log("👥 Novos seguidores:", updatedFollowers);
                return { ...prev, followers: updatedFollowers };
            });
        } catch (err) {
            console.error("❌ Erro ao seguir/desseguir usuário:", err);
            message.error("Erro ao seguir usuário.");
        }
    };

    // ⭐ Alterna o estado de favoritar/desfavoritar
    const handleFavoriteToggle = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const endpoint = isFavorited ? "unfavorite" : "favorite";

            const res = await fetch(`${BASE_URL}/api/users/${user._id}/${endpoint}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("❌ Erro bruto na resposta:", text);
                throw new Error(`Falha ao ${isFavorited ? "desfavoritar" : "favoritar"}.`);
            }

            const result = await res.json();
            console.log(`⭐ Resultado da ação de ${isFavorited ? "desfavoritar" : "favoritar"}:`, result);

            // ✅ Atualiza o estado de favoritos visualmente
            setIsFavorited((prev) => !prev);

            message.success(isFavorited ? "Usuário desfavoritado!" : "Usuário favoritado!");
        } catch (err) {
            console.error("❌ Erro ao favoritar/desfavoritar usuário:", err);
            message.error(`Erro ao ${isFavorited ? "desfavoritar" : "favoritar"} usuário.`);
        } finally {
            setLoading(false);
        }
    };

    // 📆 Calcula idade a partir da data de nascimento
    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return null;
        const nasc = new Date(dataNasc);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade;
    };

    // 📅 Formata a data de nascimento com idade
    const formatarData = (dataISO) => {
        if (!dataISO) return "Data não informada";
        const data = new Date(dataISO);
        return `${data.toLocaleDateString("pt-BR")} (${calcularIdade(dataISO)} anos)`;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Card>
                <Row gutter={[24, 16]} align="middle">
                    <Col>
                        <Avatar size={80} src={user?.avatar || "/profile-default.svg"} />
                    </Col>
                    <Col flex="auto">
                        <Typography.Title level={4}>
                            {user?.nome} {user?.sobrenome}
                        </Typography.Title>
                        <Typography.Text type="secondary">@{user?.username}</Typography.Text><br />
                        {user?.sexo && <Typography.Text>Sexo: {user.sexo}</Typography.Text>}<br />
                        {user?.dataNascimento && (
                            <Typography.Text>
                                Nascimento: {formatarData(user.dataNascimento)}
                            </Typography.Text>
                        )}
                    </Col>
                    <Col>
                        <Space direction="vertical">
                            <div><strong>👥 Seguidores:</strong> {user?.followers?.length || 0}</div>
                            <div><strong>⭐ Favoritos:</strong> {user?.favoritosCount || 0}</div>
                        </Space>

                        {userIdLogado && !isOwnProfile && user && userIdLogado !== user._id && (
                            <Space direction="vertical" style={{ marginTop: 12 }}>
                                <Button
                                    type={isFollowing ? "default" : "primary"}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? "➖ Deixar de seguir" : "➕ Seguir"}
                                </Button>

                                <Button
                                    type={isFavorited ? "primary" : "default"}
                                    icon={isFavorited ? <StarFilled /> : <StarOutlined />}
                                    onClick={handleFavoriteToggle}
                                    loading={loading}
                                >
                                    {isFavorited ? "Desfavoritar" : "Favoritar"}
                                </Button>
                            </Space>
                        )}
                    </Col>
                </Row>
            </Card>
        </motion.div>
    );
};

export default CardPerfil;
