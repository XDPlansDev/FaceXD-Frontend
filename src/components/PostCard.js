import { useState } from "react";
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
  useColorMode
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

export default function PostCard({ post, onDelete }) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { colorMode } = useColorMode();

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
    try {
      await api.delete(`/posts/${post._id}`);
      onDelete(post._id);
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
            name={post.author.nome}
            src={post.author.avatar}
            cursor="pointer"
            onClick={() => router.push(`/profile/${post.author.username}`)}
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text
              fontWeight="bold"
              cursor="pointer"
              onClick={() => router.push(`/profile/${post.author.username}`)}
            >
              {post.author.nome}
            </Text>
            <Text fontSize="sm" color="gray.500">
              @{post.author.username}
            </Text>
          </VStack>
          {user?._id === post.author._id && (
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
              onClick={() => router.push(`/post/${post._id}`)}
              aria-label="Comentar"
            />
            <Text>{post.comments.length}</Text>
          </HStack>
          <IconButton
            icon={<FaShare />}
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
              toast({
                title: "Link copiado!",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
            }}
            aria-label="Compartilhar"
          />
        </HStack>
      </Box>
    </Box>
  );
}
