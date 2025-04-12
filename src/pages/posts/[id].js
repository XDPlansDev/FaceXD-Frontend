import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function PostDetails() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchPostDetails();
        }
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            const response = await api.get(`/posts/${id}`);
            setPost(response.data);
            setComments(response.data.comments || []);
        } catch (error) {
            console.error('Erro ao carregar detalhes do post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            const response = await api.post(`/posts/${id}/like`);
            setPost(response.data);
        } catch (error) {
            console.error('Erro ao curtir o post:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await api.post(`/posts/${id}/comments`, {
                content: newComment
            });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
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

    if (!post) {
        return <div className="flex justify-center items-center min-h-screen">Post não encontrado</div>;
    }

    const { date, time } = formatDateTime(post.createdAt);

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex items-center mb-4">
                    <img
                        src={post.author.avatar || '/default-avatar.png'}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <h2 className="font-semibold">{post.author.name}</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{date}</span>
                            <span>•</span>
                            <a
                                href={`/posts/${post._id}`}
                                className="text-blue-500 hover:underline"
                            >
                                {time}
                            </a>
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
                                    src={comment.author.avatar || '/default-avatar.png'}
                                    alt={comment.author.name}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <div>
                                    <p className="font-semibold">{comment.author.name}</p>
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
