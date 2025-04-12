import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Link from 'next/link';
import { useToast } from '@chakra-ui/react';

export default function PostDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const toast = useToast();

    useEffect(() => {
        if (!id) return;

        console.log('🔍 ID do post:', id);
        console.log('📍 Query completa:', router.query);

        fetchPostDetails();
    }, [id, router.query]);

    const fetchPostDetails = async () => {
        try {
            setLoading(true);
            console.log('📡 Fazendo requisição para:', `/posts/${id}`);

            const response = await api.get(`/posts/${id}`);
            console.log('📦 Resposta do servidor:', response.data);

            if (!response.data) {
                console.error('❌ Post não encontrado');
                setError('Post não encontrado');
                return;
            }

            setPost(response.data);
            setComments(response.data.comments || []);
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
            setPost(prev => ({
                ...prev,
                likes: response.data.likes
            }));
            toast({
                title: response.data.likedByUser ? "Post curtido!" : "Curtida removida",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Erro ao curtir o post:', error);
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
            console.error('Erro ao adicionar comentário:', error);
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o comentário",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // Função para formatar a data e hora
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const formattedTime = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return { date: formattedDate, time: formattedTime };
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
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center mb-4">
                    <img
                        src={post.userId?.avatar || '/default-avatar.png'}
                        alt={post.userId?.nome}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <h2 className="font-semibold">{post.userId?.nome}</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link href={`/profile/${post.userId?.username}`}>
                                <a className="text-blue-500 hover:underline">
                                    @{post.userId?.username}
                                </a>
                            </Link>
                            <span>•</span>
                            <span>{date}</span>
                            <span>•</span>
                            <span className="text-blue-500">{time}</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-800 mb-4">{post.content}</p>

                {post.image && (
                    <img
                        src={post.image}
                        alt="Post image"
                        className="w-full rounded-lg mb-4"
                    />
                )}

                <div className="flex items-center justify-between border-t pt-4">
                    <button
                        onClick={handleLike}
                        className="flex items-center text-gray-500 hover:text-blue-500"
                    >
                        <span className="mr-2">❤️</span>
                        <span>{post.likes?.length || 0} curtidas</span>
                    </button>
                    <span className="text-gray-500">
                        {comments.length} comentários
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold mb-4">Comentários</h3>

                <form onSubmit={handleComment} className="mb-6">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="w-full p-2 border rounded-lg resize-none"
                        rows="3"
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Comentar
                    </button>
                </form>

                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id} className="border-b pb-4">
                            <div className="flex items-center mb-2">
                                <img
                                    src={comment.userId?.avatar || '/default-avatar.png'}
                                    alt={comment.userId?.nome}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <div>
                                    <p className="font-semibold">{comment.userId?.nome}</p>
                                    <Link href={`/profile/${comment.userId?.username}`}>
                                        <a className="text-sm text-blue-500 hover:underline">
                                            @{comment.userId?.username}
                                        </a>
                                    </Link>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-800">{comment.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
