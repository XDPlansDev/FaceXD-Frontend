import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    Button,
    Input,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useToast,
    Spinner,
    Center,
    Divider,
    useColorMode,
    Tooltip,
    Badge,
    Flex
} from "@chakra-ui/react";
import { FaEllipsisV, FaHeart, FaRegHeart, FaReply, FaTrash, FaEdit, FaEllipsisH } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Comments({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { user } = useAuth();
    const toast = useToast();
    const { colorMode } = useColorMode();

    // Buscar comentários
    const fetchComments = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await api.get(`/comments/${postId}?page=${pageNum}&limit=10`);

            if (append) {
                setComments(prev => [...prev, ...response.data.comments]);
            } else {
                setComments(response.data.comments);
            }

            setHasMore(response.data.currentPage < response.data.totalPages);
        } catch (error) {
            console.error("Erro ao buscar comentários:", error);
            toast({
                title: "Erro ao carregar comentários",
                description: "Não foi possível carregar os comentários deste post",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Carregar mais comentários
    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComments(nextPage, true);
    };

    // Enviar comentário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            setSubmitting(true);
            const response = await api.post(`/api/comments/${postId}`, { content: newComment });
            setNewComment("");
            await fetchComments();
            toast({
                title: "Comentário adicionado",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o comentário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Editar comentário
    const handleEdit = async (commentId, newContent) => {
        try {
            await api.put(`/comments/${commentId}`, { content: newContent });
            await fetchComments();
            setEditingComment(null);
            toast({
                title: "Comentário atualizado",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Erro ao editar comentário:", error);
            toast({
                title: "Erro ao editar comentário",
                description: "Não foi possível atualizar seu comentário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Deletar comentário
    const handleDelete = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            await fetchComments();
            toast({
                title: "Comentário deletado",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível deletar o comentário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Curtir/Descurtir comentário
    const handleLike = async (commentId) => {
        if (!user) {
            toast({
                title: "Erro",
                description: "Você precisa estar logado para curtir comentários",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await api.put(`/comments/${commentId}/like`);
            await fetchComments();
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível curtir o comentário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Carregar comentários ao montar o componente
    useEffect(() => {
        fetchComments();
    }, [postId]);

    // Componente de comentário individual
    const CommentItem = ({ comment, isReply = false }) => {
        const isAuthor = user && comment.author._id === user._id;
        const isEditing = editingComment === comment._id;
        const [editContent, setEditContent] = useState(comment.content);

        return (
            <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg={colorMode === "light" ? "white" : "gray.700"}
                mb={2}
                ml={isReply ? 8 : 0}
            >
                <Flex justifyContent="space-between" alignItems="flex-start">
                    <HStack spacing={3} align="flex-start">
                        <Avatar
                            size="sm"
                            name={comment.author.nome}
                            src={comment.author.avatar}
                        />
                        <Box flex="1">
                            <HStack spacing={2} mb={1}>
                                <Text fontWeight="bold">{comment.author.nome}</Text>
                                <Text fontSize="xs" color="gray.500">
                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </HStack>

                            {isEditing ? (
                                <Box>
                                    <Input
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        mb={2}
                                    />
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            colorScheme="blue"
                                            onClick={() => handleEdit(comment._id, editContent)}
                                        >
                                            Salvar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingComment(null)}
                                        >
                                            Cancelar
                                        </Button>
                                    </HStack>
                                </Box>
                            ) : (
                                <Text>{comment.content}</Text>
                            )}

                            {!isEditing && (
                                <HStack spacing={4} mt={2}>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        leftIcon={comment.likes.includes(user?._id) ? <FaHeart color="red" /> : <FaRegHeart />}
                                        onClick={() => handleLike(comment._id)}
                                    >
                                        {comment.likes.length}
                                    </Button>

                                    {!isReply && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            leftIcon={<FaReply />}
                                            onClick={() => setReplyTo(comment)}
                                        >
                                            Responder
                                        </Button>
                                    )}
                                </HStack>
                            )}
                        </Box>
                    </HStack>

                    {isAuthor && !isEditing && (
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                icon={<FaEllipsisH />}
                                variant="ghost"
                                size="sm"
                            />
                            <MenuList>
                                <MenuItem
                                    icon={<FaEdit />}
                                    onClick={() => setEditingComment(comment._id)}
                                >
                                    Editar
                                </MenuItem>
                                <MenuItem
                                    icon={<FaTrash />}
                                    color="red.500"
                                    onClick={() => handleDelete(comment._id)}
                                >
                                    Deletar
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </Flex>

                {/* Respostas ao comentário */}
                {comment.replies && comment.replies.length > 0 && (
                    <VStack align="stretch" mt={2}>
                        {comment.replies.map(reply => (
                            <CommentItem key={reply._id} comment={reply} isReply={true} />
                        ))}
                    </VStack>
                )}
            </Box>
        );
    };

    return (
        <Box>
            {/* Formulário de comentário */}
            <form onSubmit={handleSubmit}>
                <HStack spacing={3} mb={4}>
                    <Avatar
                        size="sm"
                        name={user?.nome}
                        src={user?.avatar}
                    />
                    <Input
                        placeholder={replyTo ? `Responder a ${replyTo.author.nome}...` : "Escreva um comentário..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={submitting}
                        isDisabled={!newComment.trim()}
                    >
                        {replyTo ? "Responder" : "Comentar"}
                    </Button>
                </HStack>

                {replyTo && (
                    <HStack
                        p={2}
                        bg={colorMode === "light" ? "blue.50" : "blue.900"}
                        borderRadius="md"
                        mb={4}
                    >
                        <Text fontSize="sm">
                            Respondendo a <strong>{replyTo.author.nome}</strong>
                        </Text>
                        <IconButton
                            icon={<FaTrash />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyTo(null)}
                        />
                    </HStack>
                )}
            </form>

            {/* Lista de comentários */}
            {loading && comments.length === 0 ? (
                <Center py={10}>
                    <Spinner size="xl" />
                </Center>
            ) : comments.length > 0 ? (
                <VStack align="stretch" spacing={4}>
                    {comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))}

                    {hasMore && (
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            isLoading={loading}
                        >
                            Carregar mais comentários
                        </Button>
                    )}
                </VStack>
            ) : (
                <Center py={10}>
                    <Text color="gray.500">Nenhum comentário ainda. Seja o primeiro a comentar!</Text>
                </Center>
            )}
        </Box>
    );
} 