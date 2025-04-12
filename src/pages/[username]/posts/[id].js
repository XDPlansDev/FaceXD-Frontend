import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Link from 'next/link';
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Avatar,
    Button,
    useToast,
    Textarea,
    IconButton,
} from '@chakra-ui/react';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

export default function PostDetails() {
    const router = useRouter();
    const { username, id } = router.query;
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const toast = useToast();

    useEffect(() => {
        if (!id) return;

        console.log('🔍 Buscando post:', {
            username,
            postId: id
        });

        fetchPostDetails();
    }, [id, username]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            console.log(`📡 Fazendo requisição para: /api/posts/${id}`);

            const response = await api.get(`/api/posts/${id}`);
            console.log('📦 Resposta do servidor:', response.data);

            if (!response.data) {
                console.error('❌ Post não encontrado');
                setError('Post não encontrado');
                return;
            }

            setPost(response.data);
            setComments(response.data.comments || []);
            setLikeCount(response.data.likes?.length || 0);
            setIsLiked(response.data.likes?.includes(user?._id) || false);
            setError(null);
        } catch (error) {
            console.error('❌ Erro ao carregar post:', error.response || error);
            const errorMessage = error.response?.data?.message || 'Não foi possível carregar o post';
            console.error('Mensagem de erro:', errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            toast({
                title: "Erro",
                description: "Você precisa estar logado para curtir posts",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await api.put(`/posts/${id}/like`);
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível curtir o post",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) {
            toast({
                title: "Erro",
                description: "Você precisa estar logado para comentar",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/posts/${id}/comment`, {
                content: newComment
            });
            setComments(prev => [...prev, response.data]);
            setNewComment('');
            toast({
                title: "Comentário adicionado!",
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
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: '', time: '' };
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('pt-BR'),
            time: date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen flex-col">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/feed')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Voltar para o Feed
                </button>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex justify-center items-center min-h-screen flex-col">
                <p className="text-xl mb-4">Post não encontrado</p>
                <button
                    onClick={() => router.push('/feed')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Voltar para o Feed
                </button>
            </div>
        );
    }

    const { date, time } = formatDateTime(post.createdAt);

    return (
        <Box maxW="2xl" mx="auto" p={4}>
            <Box bg="white" borderRadius="lg" shadow="md" p={6} mb={4}>
                <HStack spacing={4} mb={4}>
                    <Avatar
                        size="md"
                        name={post.userId?.nome}
                        src={post.userId?.avatar || '/default-avatar.png'}
                    />
                    <VStack align="start" spacing={0}>
                        <Text fontWeight="bold">{post.userId?.nome}</Text>
                        <HStack spacing={2}>
                            <Link href={`/${post.userId?.username}`}>
                                <Text
                                    as="a"
                                    color="blue.500"
                                    fontSize="sm"
                                    _hover={{ textDecoration: "underline" }}
                                >
                                    @{post.userId?.username}
                                </Text>
                            </Link>
                            <Text fontSize="sm" color="gray.500">•</Text>
                            <Text fontSize="sm" color="gray.500">{date}</Text>
                            <Text fontSize="sm" color="gray.500">•</Text>
                            <Text fontSize="sm" color="gray.500">{time}</Text>
                        </HStack>
                    </VStack>
                </HStack>

                <Text mb={4}>{post.content}</Text>

                {post.image && (
                    <Image
                        src={post.image}
                        alt="Post image"
                        borderRadius="md"
                        mb={4}
                        maxH="500px"
                        objectFit="cover"
                        w="100%"
                    />
                )}

                <HStack spacing={4} pt={2} borderTop="1px" borderColor="gray.200">
                    <HStack spacing={1} onClick={handleLike} cursor="pointer">
                        <IconButton
                            icon={isLiked ? <FaHeart color="#E53E3E" /> : <FaRegHeart />}
                            variant="ghost"
                            size="sm"
                            aria-label="Like"
                        />
                        <Text>{likeCount}</Text>
                    </HStack>
                    <HStack spacing={1}>
                        <IconButton
                            icon={<FaComment />}
                            variant="ghost"
                            size="sm"
                            aria-label="Comment"
                        />
                        <Text>{comments.length}</Text>
                    </HStack>
                </HStack>
            </Box>

            <Box bg="white" borderRadius="lg" shadow="md" p={6}>
                <Text fontWeight="bold" mb={4}>Comentários</Text>

                <form onSubmit={handleComment}>
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        mb={2}
                    />
                    <Button
                        type="submit"
                        colorScheme="blue"
                        isDisabled={!newComment.trim()}
                    >
                        Comentar
                    </Button>
                </form>

                <VStack spacing={4} mt={6} align="stretch">
                    {comments.map((comment) => (
                        <Box key={comment._id} pb={4} borderBottom="1px" borderColor="gray.200">
                            <HStack spacing={3} mb={2}>
                                <Avatar
                                    size="sm"
                                    name={comment.userId?.nome}
                                    src={comment.userId?.avatar || '/default-avatar.png'}
                                />
                                <VStack align="start" spacing={0}>
                                    <Link href={`/${comment.userId?.username}`}>
                                        <Text
                                            as="a"
                                            fontWeight="bold"
                                            _hover={{ textDecoration: "underline" }}
                                        >
                                            {comment.userId?.nome}
                                        </Text>
                                    </Link>
                                    <Text fontSize="sm" color="gray.500">
                                        @{comment.userId?.username}
                                    </Text>
                                </VStack>
                            </HStack>
                            <Text ml={11}>{comment.content}</Text>
                        </Box>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
} 