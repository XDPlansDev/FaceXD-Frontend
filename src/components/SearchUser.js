import { useState, useEffect } from "react";
import {
    Box,
    Input,
    VStack,
    HStack,
    Avatar,
    Text,
    Button,
    useToast,
    Spinner,
    useColorMode,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { FaSearch } from "react-icons/fa";
import api from "@/services/api";

export default function SearchUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.length < 3) {
                setUsers([]);
                return;
            }

            try {
                setLoading(true);
                const response = await api.get(`/api/users/search?query=${encodeURIComponent(searchTerm)}`);
                setUsers(response.data);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
                toast({
                    title: "Erro",
                    description: "Não foi possível buscar usuários",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSendFriendRequest = async (userId) => {
        try {
            await api.post(`/api/users/${userId}/friend-request`);
            toast({
                title: "Solicitação enviada",
                description: "Sua solicitação de amizade foi enviada",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao enviar solicitação:", error);
            toast({
                title: "Erro",
                description: "Não foi possível enviar a solicitação de amizade",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleOpenSearch = () => {
        setSearchTerm("");
        setUsers([]);
        onOpen();
    };

    return (
        <>
            <IconButton
                icon={<FaSearch />}
                variant="ghost"
                aria-label="Buscar usuários"
                onClick={handleOpenSearch}
            />

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Buscar Usuários</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Input
                            placeholder="Digite pelo menos 3 caracteres..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            mb={4}
                            autoFocus
                        />

                        {loading ? (
                            <Box textAlign="center" py={4}>
                                <Spinner />
                            </Box>
                        ) : (
                            <VStack spacing={2} align="stretch" maxH="60vh" overflowY="auto">
                                {users.map((searchedUser) => (
                                    <Box
                                        key={searchedUser._id}
                                        p={3}
                                        borderWidth="1px"
                                        borderRadius="md"
                                        bg={colorMode === "light" ? "white" : "gray.700"}
                                    >
                                        <HStack spacing={3}>
                                            <Avatar
                                                size="sm"
                                                name={searchedUser.nome}
                                                src={searchedUser.avatar}
                                                cursor="pointer"
                                                onClick={() => {
                                                    router.push(`/profile/${searchedUser.username}`);
                                                    onClose();
                                                }}
                                            />
                                            <Box flex={1}>
                                                <Text fontWeight="bold">{searchedUser.nome}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    @{searchedUser.username}
                                                </Text>
                                            </Box>
                                            {searchedUser._id !== user?._id && (
                                                <Button
                                                    size="sm"
                                                    colorScheme="blue"
                                                    onClick={() => handleSendFriendRequest(searchedUser._id)}
                                                >
                                                    Adicionar
                                                </Button>
                                            )}
                                        </HStack>
                                    </Box>
                                ))}
                                {searchTerm.length >= 3 && users.length === 0 && (
                                    <Text color="gray.500" textAlign="center" py={4}>
                                        Nenhum usuário encontrado
                                    </Text>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
