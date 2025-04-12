import { useState } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Image,
    Button,
    useColorMode,
    Divider,
    Collapse,
    Badge
} from "@chakra-ui/react";
import { FaEllipsisV, FaHeart, FaRegHeart, FaComment, FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import Comments from "./Comments";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Post({ post, onDelete, onEdit }) {
    const [showComments, setShowComments] = useState(false);
    const [likes, setLikes] = useState(post.likes || []);
    const [likedByUser, setLikedByUser] = useState(post.likedByUser || false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);
    const { user } = useAuth();
    const toast = useToast();
    const { colorMode } = useColorMode();

    const isAuthor = user && post.userId._id === user.id;

    // Curtir/Descurtir post
    const handleLike = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/posts/${post._id}/like`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao curtir post");

            const { likes: newLikes, likedByUser: newLikedByUser } = await response.json();
            setLikes(newLikes);
            setLikedByUser(newLikedByUser);
        } catch (error) {
            console.error("Erro ao curtir post:", error);
            toast({
                title: "Erro ao curtir post",
                description: "Não foi possível curtir este post",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Atualizar contagem de comentários
    const handleCommentAdded = () => {
        setCommentCount(prev => prev + 1);
    };

    const handleCommentDeleted = () => {
        setCommentCount(prev => Math.max(0, prev - 1));
    };

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg={colorMode === "light" ? "white" : "gray.700"}
            mb={4}
        >
            {/* Cabeçalho do post */}
            <HStack p={4} spacing={3}>
                <Avatar
                    name={post.userId.nome}
                    src={post.userId.avatar}
                />
                <Box flex="1">
                    <Text fontWeight="bold">{post.userId.nome}</Text>
                    <Text fontSize="sm" color="gray.500">
                        {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </Box>

                {isAuthor && (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                        />
                        <MenuList>
                            <MenuItem
                                icon={<FaEdit />}
                                onClick={() => onEdit(post)}
                            >
                                Editar
                            </MenuItem>
                            <MenuItem
                                icon={<FaTrash />}
                                color="red.500"
                                onClick={() => onDelete(post._id)}
                            >
                                Deletar
                            </MenuItem>
                        </MenuList>
                    </Menu>
                )}
            </HStack>

            {/* Conteúdo do post */}
            <Box px={4} pb={4}>
                <Text whiteSpace="pre-wrap">{post.content}</Text>

                {post.image && (
                    <Image
                        src={post.image}
                        alt="Imagem do post"
                        borderRadius="md"
                        mt={4}
                        maxH="500px"
                        objectFit="cover"
                    />
                )}
            </Box>

            {/* Ações do post */}
            <Box px={4} pb={4}>
                <HStack spacing={4}>
                    <Button
                        variant="ghost"
                        leftIcon={likedByUser ? <FaHeart color="red" /> : <FaRegHeart />}
                        onClick={handleLike}
                    >
                        {likes.length}
                    </Button>

                    <Button
                        variant="ghost"
                        leftIcon={<FaComment />}
                        onClick={() => setShowComments(!showComments)}
                    >
                        {commentCount}
                    </Button>
                </HStack>
            </Box>

            {/* Seção de comentários */}
            <Collapse in={showComments}>
                <Divider />
                <Box p={4}>
                    <Comments
                        postId={post._id}
                        onCommentAdded={handleCommentAdded}
                        onCommentDeleted={handleCommentDeleted}
                    />
                </Box>
            </Collapse>
        </Box>
    );
} 