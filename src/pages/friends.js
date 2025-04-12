import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    Button,
    Flex,
    Spinner,
    Center,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorMode,
    Badge,
    Divider,
    Link
} from "@chakra-ui/react";
import { FaUserFriends, FaUserPlus, FaUserMinus, FaCheck, FaTimes } from "react-icons/fa";
import Head from "next/head";
import api from "../services/api";

export default function FriendsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const router = useRouter();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        fetchFriends();
    }, [user, router]);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            const [userResponse, receivedRequestsResponse] = await Promise.all([
                api.get("/api/users/me"),
                api.get("/api/users/friend-requests")
            ]);

            setFriends(userResponse.data.friends || []);
            setReceivedRequests(receivedRequestsResponse.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar amigos:", error);
            setLoading(false);
            toast({
                title: "Erro",
                description: "Não foi possível carregar seus amigos.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAcceptFriend = async (userId) => {
        try {
            await api.put(`/api/users/${userId}/accept-friend`);
            toast({
                title: "Solicitação aceita",
                description: "Vocês agora são amigos!",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchFriends();
        } catch (error) {
            console.error("Erro ao aceitar amizade:", error);
            toast({
                title: "Erro ao aceitar solicitação",
                description: "Não foi possível aceitar a solicitação de amizade",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRejectFriend = async (userId) => {
        try {
            await api.put(`/api/users/${userId}/reject-friend`);
            toast({
                title: "Solicitação rejeitada",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriends();
        } catch (error) {
            console.error("Erro ao rejeitar amizade:", error);
            toast({
                title: "Erro ao rejeitar solicitação",
                description: "Não foi possível rejeitar a solicitação de amizade",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCancelRequest = async (userId) => {
        try {
            await api.put(`/api/users/${userId}/cancel-friend-request`);
            toast({
                title: "Solicitação cancelada",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriends();
        } catch (error) {
            console.error("Erro ao cancelar solicitação:", error);
            toast({
                title: "Erro ao cancelar solicitação",
                description: "Não foi possível cancelar a solicitação de amizade",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRemoveFriend = async (userId) => {
        try {
            await api.put(`/api/users/${userId}/remove-friend`);
            toast({
                title: "Amigo removido",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            fetchFriends();
        } catch (error) {
            console.error("Erro ao remover amigo:", error);
            toast({
                title: "Erro ao remover amigo",
                description: "Não foi possível remover o amigo",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Amigos | Face XD</title>
            </Head>

            <Container maxW="container.lg" py={8}>
                <Heading mb={6}>Amigos</Heading>

                <Tabs isFitted variant="enclosed">
                    <TabList mb="1em">
                        <Tab>
                            Amigos
                            {friends.length > 0 && (
                                <Badge ml={2} colorScheme="blue">
                                    {friends.length}
                                </Badge>
                            )}
                        </Tab>
                        <Tab>
                            Solicitações Recebidas
                            {receivedRequests.length > 0 && (
                                <Badge ml={2} colorScheme="green">
                                    {receivedRequests.length}
                                </Badge>
                            )}
                        </Tab>
                        <Tab>
                            Solicitações Enviadas
                            {sentRequests.length > 0 && (
                                <Badge ml={2} colorScheme="yellow">
                                    {sentRequests.length}
                                </Badge>
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        {/* Aba de Amigos */}
                        <TabPanel>
                            {loading ? (
                                <Center py={10}>
                                    <Spinner size="xl" />
                                </Center>
                            ) : friends.length > 0 ? (
                                <VStack spacing={4} align="stretch">
                                    {friends.map((friend) => (
                                        <Box
                                            key={friend._id}
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            bg={colorMode === "light" ? "white" : "gray.700"}
                                        >
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        name={friend.nome}
                                                        src={friend.avatar}
                                                    />
                                                    <Box>
                                                        <Link href={`/profile/${friend.username}`}>
                                                            <Text fontWeight="bold">{friend.nome}</Text>
                                                        </Link>
                                                        <Text fontSize="sm" color="gray.500">
                                                            @{friend.username}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    leftIcon={<FaUserMinus />}
                                                    onClick={() => handleRemoveFriend(friend._id)}
                                                >
                                                    Remover
                                                </Button>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Center py={10}>
                                    <VStack spacing={4}>
                                        <FaUserFriends size="3em" />
                                        <Text color="gray.500">Você ainda não tem amigos</Text>
                                        <Button
                                            colorScheme="blue"
                                            leftIcon={<FaUserPlus />}
                                            onClick={() => router.push("/search")}
                                        >
                                            Encontrar Amigos
                                        </Button>
                                    </VStack>
                                </Center>
                            )}
                        </TabPanel>

                        {/* Aba de Solicitações Recebidas */}
                        <TabPanel>
                            {loading ? (
                                <Center py={10}>
                                    <Spinner size="xl" />
                                </Center>
                            ) : receivedRequests.length > 0 ? (
                                <VStack spacing={4} align="stretch">
                                    {receivedRequests.map((request) => (
                                        <Box
                                            key={request._id}
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            bg={colorMode === "light" ? "white" : "gray.700"}
                                        >
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        name={request.nome}
                                                        src={request.avatar}
                                                    />
                                                    <Box>
                                                        <Link href={`/profile/${request.username}`}>
                                                            <Text fontWeight="bold">{request.nome}</Text>
                                                        </Link>
                                                        <Text fontSize="sm" color="gray.500">
                                                            @{request.username}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <HStack spacing={2}>
                                                    <Button
                                                        colorScheme="green"
                                                        leftIcon={<FaCheck />}
                                                        onClick={() => handleAcceptFriend(request._id)}
                                                    >
                                                        Aceitar
                                                    </Button>
                                                    <Button
                                                        colorScheme="red"
                                                        variant="ghost"
                                                        leftIcon={<FaTimes />}
                                                        onClick={() => handleRejectFriend(request._id)}
                                                    >
                                                        Rejeitar
                                                    </Button>
                                                </HStack>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Center py={10}>
                                    <Text color="gray.500">Nenhuma solicitação de amizade recebida</Text>
                                </Center>
                            )}
                        </TabPanel>

                        {/* Aba de Solicitações Enviadas */}
                        <TabPanel>
                            {loading ? (
                                <Center py={10}>
                                    <Spinner size="xl" />
                                </Center>
                            ) : sentRequests.length > 0 ? (
                                <VStack spacing={4} align="stretch">
                                    {sentRequests.map((request) => (
                                        <Box
                                            key={request._id}
                                            p={4}
                                            borderWidth="1px"
                                            borderRadius="lg"
                                            bg={colorMode === "light" ? "white" : "gray.700"}
                                        >
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    <Avatar
                                                        size="md"
                                                        name={request.nome}
                                                        src={request.avatar}
                                                    />
                                                    <Box>
                                                        <Link href={`/profile/${request.username}`}>
                                                            <Text fontWeight="bold">{request.nome}</Text>
                                                        </Link>
                                                        <Text fontSize="sm" color="gray.500">
                                                            @{request.username}
                                                        </Text>
                                                    </Box>
                                                </HStack>
                                                <Button
                                                    colorScheme="red"
                                                    variant="ghost"
                                                    leftIcon={<FaTimes />}
                                                    onClick={() => handleCancelRequest(request._id)}
                                                >
                                                    Cancelar
                                                </Button>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            ) : (
                                <Center py={10}>
                                    <Text color="gray.500">Nenhuma solicitação de amizade enviada</Text>
                                </Center>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Container>
        </>
    );
} 