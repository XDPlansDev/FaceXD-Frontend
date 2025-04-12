import { useState, useEffect } from "react";
import {
  Box,
  Text,
  Image,
  Avatar,
  IconButton,
  HStack,
  VStack,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Link
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (post?.likes && user?._id) {
      setIsLiked(post.likes.includes(user._id));
      setLikeCount(post.likes.length);
    }
  }, [post?.likes, user?._id]);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Usuário';
    return fullName.split(' ')[0];
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

  const { date, time } = formatDateTime(post?.createdAt);

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
      await api.put(`/posts/${post._id}/like`);
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

  const handleDelete = async () => {
    if (!post?._id) return;

    try {
      await api.delete(`/posts/${post._id}`);
      onDelete?.(post._id);
      toast({
        title: "Post deletado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const navigateToProfile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post?.author?.username) {
      router.push(`/profile/${post.author.username}`);
    }
  };

  const navigateToPost = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (post?._id) {
      router.push(`/posts/${post._id}`);
    }
  };

  if (!post) {
    return null;
  }

  // Console log para debug
  console.log("Post data:", {
    id: post._id,
    author: post.author,
    userId: post.userId,
    username: post.author?.username || post.userId?.username
  });

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={colorMode === "light" ? "white" : "gray.700"}
      mb={4}
    >
      <Box p={4}>
        <HStack spacing={4} mb={4}>
          <Avatar
            size="sm"
            name={post.author?.nome || post.userId?.nome || 'Usuário'}
            src={post.author?.avatar || post.userId?.avatar}
            cursor="pointer"
            onClick={navigateToProfile}
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text
              fontWeight="bold"
              cursor="pointer"
              onClick={navigateToProfile}
            >
              {getFirstName(post.author?.nome || post.userId?.nome)}
            </Text>
            <HStack spacing={2}>
              <Link
                onClick={navigateToProfile}
                fontSize="sm"
                color="gray.500"
                _hover={{ textDecoration: "underline", color: "blue.500" }}
                cursor="pointer"
              >
                @{post.author?.username || post.userId?.username || 'usuario'}
              </Link>
              <Text fontSize="sm" color="gray.500">•</Text>
              <Text fontSize="sm" color="gray.500">{date}</Text>
              <Text fontSize="sm" color="gray.500">•</Text>
              <Link
                onClick={navigateToPost}
                fontSize="sm"
                color="blue.500"
                _hover={{ textDecoration: "underline" }}
                cursor="pointer"
              >
                {time}
              </Link>
            </HStack>
          </VStack>
          {user?._id === (post.author?._id || post.userId?._id) && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisH />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem onClick={handleDelete}>Deletar post</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>

        <Box
          onClick={navigateToPost}
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
        >
          <Text mb={4}>{post.content}</Text>

          {post.image && (
            <Image
              src={post.image}
              alt="Post image"
              borderRadius="md"
              mb={4}
              maxH="500px"
              objectFit="cover"
            />
          )}
        </Box>

        <HStack spacing={4}>
          <HStack>
            <IconButton
              icon={isLiked ? <FaHeart color="red" /> : <FaRegHeart />}
              variant="ghost"
              onClick={handleLike}
              aria-label="Curtir"
            />
            <Text>{likeCount}</Text>
          </HStack>
          <HStack>
            <IconButton
              icon={<FaComment />}
              variant="ghost"
              onClick={navigateToPost}
              aria-label="Comentar"
            />
            <Text>{post.comments?.length || 0}</Text>
          </HStack>
          <IconButton
            icon={<FaShare />}
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (post?._id) {
                const postUrl = `${window.location.origin}/posts/${post._id}`;
                navigator.clipboard.writeText(postUrl);
                toast({
                  title: "Link copiado!",
                  description: "Link do post copiado para a área de transferência",
                  status: "success",
                  duration: 2000,
                  isClosable: true,
                });
              }
            }}
            aria-label="Compartilhar"
          />
        </HStack>
      </Box>
    </Box>
  );
}
