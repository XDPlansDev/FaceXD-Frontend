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
    Icon,
    Tooltip,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Skeleton,
    useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaStar, FaRegStar, FaUserFriends, FaHeart, FaCalendarAlt, FaBirthdayCake } from "react-icons/fa";

const CardPerfil = ({ user, isOwnProfile }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [idade, setIdade] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const toast = useToast();
    const userIdLogado = localStorage.getItem("userId");
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    // Cores para modo claro/escuro
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.800", "white");
    const subTextColor = useColorModeValue("gray.500", "gray.400");

    // Debug para verificar os valores
    useEffect(() => {
        console.log("🔍 Debug - Valores importantes:");
        console.log("User ID Logado:", userIdLogado);
        console.log("User ID do Perfil:", user?._id);
        console.log("isOwnProfile:", isOwnProfile);
    }, [user, userIdLogado, isOwnProfile]);

    // Verifica se deve mostrar os botões de ação
    useEffect(() => {
        const isLoggedIn = Boolean(userIdLogado);
        const isNotOwnProfile = user?._id !== userIdLogado;

        console.log("Verificação de ações:");
        console.log("- Usuário está logado?", isLoggedIn);
        console.log("- Não é o próprio perfil?", isNotOwnProfile);
        console.log("- ID do perfil:", user?._id);
        console.log("- ID do usuário logado:", userIdLogado);

        setShowActions(isLoggedIn && isNotOwnProfile);
    }, [user, userIdLogado]);

    // 🔁 Verifica se o usuário logado já está seguindo o perfil
    useEffect(() => {
        if (!user || !userIdLogado) return;

        const checkIfFollowing = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${BASE_URL}/api/users/${userIdLogado}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const currentUser = await res.json();
                    const seguindo = currentUser.following?.includes(user._id);
                    console.log("🔄 Verificando se usuário logado segue esse perfil:", seguindo);
                    setIsFollowing(seguindo);
                }
            } catch (err) {
                console.error("❌ Erro ao verificar se está seguindo:", err);
            }
        };

        checkIfFollowing();
    }, [user, userIdLogado, BASE_URL]);

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

    // 🎂 Calcula a idade quando o usuário é carregado
    useEffect(() => {
        if (user?.dataNascimento) {
            console.log("Data de nascimento recebida:", user.dataNascimento);
            const idadeCalculada = calcularIdade(user.dataNascimento);
            console.log("Idade calculada:", idadeCalculada);
            setIdade(idadeCalculada);
        }
    }, [user]);

    // 👥 Alterna o estado de seguir/deixar de seguir
    const handleFollowToggle = async () => {
        if (loading) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            // Define a rota baseada na ação (seguir ou deixar de seguir)
            const endpoint = isFollowing ? 'unfollow' : 'follow';

            const res = await fetch(`${BASE_URL}/api/users/${user._id}/${endpoint}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Falha ao seguir/desseguir.");
            }

            console.log(`🔁 Resultado da ação de ${isFollowing ? 'deixar de seguir' : 'seguir'}:`, data);

            // Atualiza o estado local
            setIsFollowing((prev) => !prev);

            // Atualiza a contagem de seguidores no user
            if (user.followers) {
                const updatedFollowers = isFollowing
                    ? user.followers.filter(id => id !== userIdLogado)
                    : [...user.followers, userIdLogado];
                user.followers = updatedFollowers;
            }

            toast({
                title: isFollowing ? "Deixou de seguir" : "Seguindo",
                description: isFollowing ? "Você não segue mais este usuário" : "Você está seguindo este usuário",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            console.error("❌ Erro ao seguir/desseguir usuário:", err);
            toast({
                title: err.message || "Erro ao modificar seguidor",
                description: "Não foi possível completar a ação",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
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

    // 🎂 Função melhorada para calcular idade
    const calcularIdade = (dataNasc) => {
        if (!dataNasc) return null;

        try {
            console.log("Calculando idade para:", dataNasc);
            const hoje = new Date();
            const nascimento = new Date(dataNasc);

            // Verifica se a data é válida
            if (isNaN(nascimento.getTime())) {
                console.error("Data de nascimento inválida:", dataNasc);
                return null;
            }

            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();

            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }

            console.log("Idade calculada:", idade);
            return idade;
        } catch (error) {
            console.error("Erro ao calcular idade:", error);
            return null;
        }
    };

    // 📅 Função melhorada para formatar data
    const formatarData = (dataISO) => {
        if (!dataISO) return null;

        try {
            console.log("Formatando data:", dataISO);
            const data = new Date(dataISO);

            // Verifica se a data é válida
            if (isNaN(data.getTime())) {
                console.error("Data inválida:", dataISO);
                return null;
            }

            return data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        } catch (error) {
            console.error("Erro ao formatar data:", error);
            return null;
        }
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
            bg={bgColor}
            borderColor={borderColor}
        >
            <Box p={6}>
                <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between">
                    <HStack spacing={4} align="center">
                        <Avatar
                            size="xl"
                            name={user?.name}
                            src={user?.avatar}
                            border="3px solid"
                            borderColor="blue.400"
                        />
                        <VStack align="start" spacing={1}>
                            <Text fontSize="2xl" fontWeight="bold" color={textColor}>{user?.name || "Usuário"}</Text>
                            <Text color={subTextColor}>@{user?.username || "username"}</Text>
                        </VStack>
                    </HStack>

                    {showActions && (
                        <HStack mt={{ base: 4, md: 0 }} spacing={3}>
                            <Button
                                colorScheme={isFollowing ? "gray" : "blue"}
                                variant={isFollowing ? "outline" : "solid"}
                                onClick={handleFollowToggle}
                                isLoading={loading}
                                leftIcon={<Icon as={FaUserFriends} />}
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

                <Divider my={4} borderColor={borderColor} />

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <VStack align="start" spacing={4}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>Informações Pessoais</Text>

                        <Tooltip label="Data de nascimento" placement="top">
                            <HStack spacing={3} p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")} width="100%">
                                <Icon as={FaBirthdayCake} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" color={subTextColor}>Data de Nascimento</Text>
                                    <Text fontWeight="medium" color={textColor}>
                                        {user?.dataNascimento ? formatarData(user.dataNascimento) : "Não informada"}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Tooltip>

                        <Tooltip label="Idade" placement="top">
                            <HStack spacing={3} p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")} width="100%">
                                <Icon as={FaBirthdayCake} color="blue.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" color={subTextColor}>Idade</Text>
                                    <Text fontWeight="medium" color={textColor}>
                                        {idade !== null ? `${idade} anos` : "Não informada"}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Tooltip>

                        <Tooltip label="Membro desde" placement="top">
                            <HStack spacing={3} p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")} width="100%">
                                <Icon as={FaCalendarAlt} color="green.500" boxSize={5} />
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" color={subTextColor}>Membro desde</Text>
                                    <Text fontWeight="medium" color={textColor}>
                                        {user?.createdAt ? formatarData(user.createdAt) : "Não informada"}
                                    </Text>
                                </VStack>
                            </HStack>
                        </Tooltip>
                    </VStack>

                    <VStack align="start" spacing={4}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>Estatísticas</Text>

                        <Stat p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")} width="100%">
                            <StatLabel color={subTextColor}>Seguidores</StatLabel>
                            <StatNumber color={textColor}>{user?.followers?.length || 0}</StatNumber>
                            <StatHelpText color={subTextColor}>
                                <Icon as={FaUserFriends} mr={1} /> Pessoas que seguem este perfil
                            </StatHelpText>
                        </Stat>

                        <Stat p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")} width="100%">
                            <StatLabel color={subTextColor}>Favoritos</StatLabel>
                            <StatNumber color={textColor}>{user?.favoritosCount || 0}</StatNumber>
                            <StatHelpText color={subTextColor}>
                                <Icon as={FaHeart} mr={1} /> Pessoas que favoritaram este perfil
                            </StatHelpText>
                        </Stat>
                    </VStack>
                </Grid>

                {user?.bio && (
                    <>
                        <Divider my={4} borderColor={borderColor} />
                        <Box>
                            <Text fontWeight="bold" mb={2} color={textColor}>Biografia</Text>
                            <Text color={textColor}>{user.bio}</Text>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CardPerfil;
