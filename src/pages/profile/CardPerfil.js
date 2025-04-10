import { useEffect, useState } from "react";
import { Card, Avatar, Typography, Row, Col, Space, Button, message } from "antd";
import { motion } from "framer-motion";

const CardPerfil = ({ user, userIdLogado, BASE_URL, setUser }) => {
    const [isFollowing, setIsFollowing] = useState(false);

    // ✅ Verifica se o perfil visualizado é do usuário logado
    const isOwnProfile = userIdLogado === user?._id;

    // 🔁 Verifica se o usuário logado já está seguindo o perfil
    useEffect(() => {
        if (!user || !userIdLogado) return;

        const seguindo = user.followers?.includes(userIdLogado);
        console.log("🔄 Verificando se usuário logado segue esse perfil:", seguindo);
        setIsFollowing(seguindo);
    }, [user, userIdLogado]);

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

                        {!isOwnProfile && (
                            <div style={{ marginTop: 12 }}>
                                <Button
                                    type={isFollowing ? "default" : "primary"}
                                    onClick={handleFollowToggle}
                                >
                                    {isFollowing ? "➖ Deixar de seguir" : "➕ Seguir"}
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Card>
        </motion.div>
    );
};

export default CardPerfil;
