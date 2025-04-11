import { useState } from "react";
import {
    Input,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Avatar,
    Spinner,
    Text,
    Box,
    List,
    ListItem,
    useDisclosure,
    InputGroup,
    InputRightElement,
    IconButton
} from "@chakra-ui/react";
import { FaSearch, FaUser, FaTimes } from "react-icons/fa";
import Link from "next/link";

export default function SearchUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleSearch = async (value) => {
        const term = value.trim();
        if (term.length < 3) {
            setResults([]);
            return;
        }

        console.log("🔍 Buscando usuários por:", term);
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/users/search?query=${encodeURIComponent(term)}`);
            const data = await res.json();

            console.log("✅ Resultados recebidos:", data);
            setResults(data);
        } catch (error) {
            console.error("❌ Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setResults([]);
    };

    const renderResults = () => {
        if (loading) return <Spinner size="md" />;
        if (!results.length && searchTerm.length >= 3) return <Text>Nenhum usuário encontrado.</Text>;
        if (searchTerm.length < 3) return <Text>Digite pelo menos 3 letras para buscar.</Text>;

        return (
            <List spacing={3}>
                {results.map((user) => (
                    <ListItem key={user.id} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                        <HStack>
                            <Avatar icon={<FaUser />} />
                            <Box>
                                <Link href={`/profile/${user.username}`}>
                                    <Text fontWeight="bold">{user.name} @{user.username}</Text>
                                </Link>
                                <Text fontSize="sm" color="gray.600">Email: {user.email}</Text>
                            </Box>
                        </HStack>
                    </ListItem>
                ))}
            </List>
        );
    };

    return (
        <>
            <IconButton
                aria-label="Pesquisar usuários"
                icon={<FaSearch />}
                variant="ghost"
                onClick={onOpen}
            />
            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Pesquisar usuários</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4} align="stretch">
                            <InputGroup>
                                <Input
                                    placeholder="Pesquisar usuários..."
                                    value={searchTerm}
                                    onChange={handleInputChange}
                                    size="lg"
                                />
                                {searchTerm && (
                                    <InputRightElement>
                                        <IconButton
                                            aria-label="Limpar busca"
                                            icon={<FaTimes />}
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSearch}
                                        />
                                    </InputRightElement>
                                )}
                            </InputGroup>
                            {renderResults()}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
