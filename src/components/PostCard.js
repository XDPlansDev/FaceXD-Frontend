import { useState, useEffect, useCallback, useMemo } from "react";
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
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button
} from "@chakra-ui/react";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { useRef } from "react";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const [isLiked, setIsLiked] = useState(post?.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef();

  // Verificação de segurança para dados necessários
  if (!post || !post.userId) {
    return null;
  }

  const getFirstName = useCallback((fullName) => {
    if (!fullName) return 'Usuário';
    return fullName.split(' ')[0];
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return { date: '', time: '' };

    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }, []);

  const { date: formattedDate, time: formattedTime } = useMemo(() =>
    formatDateTime(post?.createdAt),
    [post?.createdAt, formatDateTime]
  );

  const handleLike = useCallback(async () => {
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
      setIsLiked(prev => !prev);
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
  }, [user, post._id, isLiked, toast]);

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
      setIsDeleteAlertOpen(false);
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

  const handleShare = useCallback((e) => {
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
  }, [post?._id, toast]);

  if (!post) {
    return null;
  }

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
            name={post.userId?.nome || 'Usuário'}
            src={post.userId?.avatar}
            cursor="pointer"
            onClick={() => post.userId?.username && router.push(`/profile/${post.userId.username}`)}
          />
          <VStack align="start" spacing={0} flex={1}>
            <Text
              fontWeight="bold"
              cursor="pointer"
              onClick={() => post.userId?.username && router.push(`/profile/${post.userId.username}`)}
            >
              {getFirstName(post.userId?.nome)}
            </Text>
            <HStack spacing={2} color="gray.500" fontSize="sm">
              {post.userId?.username && (
                <Text
                  as="span"
                  _hover={{ textDecoration: "underline", color: "blue.500" }}
                  cursor="pointer"
                  onClick={() => router.push(`/profile/${post.userId.username}`)}
                >
                  @{post.userId.username}
                </Text>
              )}
              {formattedDate && (
                <>
                  <Text as="span">•</Text>
                  <Text as="span">{formattedDate}</Text>
                </>
              )}
              {formattedTime && post.userId?.username && (
                <>
                  <Text as="span">•</Text>
                  <Text
                    as="span"
                    color="blue.500"
                    _hover={{ textDecoration: "underline" }}
                    cursor="pointer"
                    onClick={() => router.push(`/${post.userId.username}/posts/${post._id}`)}
                  >
                    {formattedTime}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
          {user?._id === post.userId?._id && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisH />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                <MenuItem onClick={() => setIsDeleteAlertOpen(true)} color="red.500">
                  Deletar post
                </MenuItem>
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
            maxH="400px"
            objectFit="cover"
            w="100%"
          />
        )}
      </Box>

      <Box p={4}>
        <HStack spacing={4}>
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
            <Text>{post.comments?.length || 0}</Text>
          </HStack>
          <IconButton
            icon={<FaShare />}
            variant="ghost"
            size="sm"
            aria-label="Share"
            onClick={handleShare}
            ml="auto"
          />
        </HStack>
      </Box>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={() => {
                onDelete?.(post._id);
                setIsDeleteAlertOpen(false);
              }} ml={3}>
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
