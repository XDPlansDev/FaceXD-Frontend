import { useEffect, useState } from "react";
import {
    Box,
    Avatar,
    Text,
    Flex,
    Grid,
    HStack,
    Button,
    useToast,
    VStack,
    Divider,
    Badge,
    Icon
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";

const CardPerfil = ({ user, isOwnProfile }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const userIdLogado = localStorage.getItem("userId");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

            // Atualiza o estado do usuário
            const updatedUser = { ...user };
            const alreadyFollowing = updatedUser.followers?.includes(userIdLogado);
            updatedUser.followers = alreadyFollowing
                ? updatedUser.followers.filter((id) => id !== userIdLogado)
                : [...(updatedUser.followers || []), userIdLogado];

            console.log("👥 Novos seguidores:", updatedUser.followers);

            toast({
                title: alreadyFollowing ? "Deixou de seguir" : "Seguindo",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            console.error("❌ Erro ao seguir/desseguir usuário:", err);
            toast({
                title: "Erro ao seguir usuário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
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

            if (res.ok) {
                setIsFavorited(!isFavorited);
                toast({
                    title: isFavorited ? "Removido dos favoritos" : "Adicionado aos favoritos",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error("❌ Erro ao favoritar/desfavoritar:", err);
            toast({
                title: "Erro ao favoritar usuário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return null;
        const hoje = new Date();
        const nascimento = new Date(dataNasc);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    };

    const formatarData = (dataISO) => {
        if (!dataISO) return null;
        return new Date(dataISO).toLocaleDateString("pt-BR");
    };

    return (
        <Box
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg="white"
        >
            <Box p={6}>
                <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
                    <HStack spacing={4} align="center">
                        <Avatar
                            size="xl"
                            name={user?.name}
                            src={user?.avatar}
                        />
                        <VStack align="start" spacing={1}>
                            <Text fontSize="2xl" fontWeight="bold">{user?.name}</Text>
                            <Text color="gray.500">@{user?.username}</Text>
                        </VStack>
                    </HStack>

                    {!isOwnProfile && userIdLogado && (
                        <HStack mt={{ base: 4, md: 0 }} spacing={3}>
                            <Button
                                colorScheme={isFollowing ? "gray" : "blue"}
                                variant={isFollowing ? "outline" : "solid"}
                                onClick={handleFollowToggle}
                                isLoading={loading}
                            >
                                {isFollowing ? "Deixar de Seguir" : "Seguir"}
                            </Button>
                            <Button
                                colorScheme={isFavorited ? "yellow" : "gray"}
                                variant="outline"
                                leftIcon={<Icon as={isFavorited ? FaStar : FaRegStar} />}
                                onClick={handleFavoriteToggle}
                                isLoading={loading}
                            >
                                {isFavorited ? "Favoritado" : "Favoritar"}
                            </Button>
                        </HStack>
                    )}
                </Flex>

                <Divider my={4} />

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                    <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Informações Pessoais</Text>
                        <HStack>
                            <Badge colorScheme="blue">Idade</Badge>
                            <Text>{calcularIdade(user?.birthDate)} anos</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="green">Membro desde</Badge>
                            <Text>{formatarData(user?.createdAt)}</Text>
                        </HStack>
                    </VStack>

                    <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Estatísticas</Text>
                        <HStack>
                            <Badge colorScheme="purple">Seguidores</Badge>
                            <Text>{user?.followers?.length || 0}</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="pink">Favoritos</Badge>
                            <Text>{user?.favoritosCount || 0}</Text>
                        </HStack>
                    </VStack>
                </Grid>

                {user?.bio && (
                    <>
                        <Divider my={4} />
                        <Box>
                            <Text fontWeight="bold" mb={2}>Biografia</Text>
                            <Text>{user.bio}</Text>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CardPerfil;
