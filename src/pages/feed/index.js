// 📄 /pages/feed.js

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Input,
  Button,
  Avatar,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Divider,
  Flex,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Heading,
  Textarea,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Stack,
  Badge,
  Center,
  useColorMode,
  Container
} from "@chakra-ui/react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaImage,
  FaUser,
  FaTrash
} from "react-icons/fa";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import imageCompression from "browser-image-compression";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import PostCard from "@/components/PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { colorMode } = useColorMode();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    aspect: 1
  });
  const [imageRef, setImageRef] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Memoize a função para evitar recriações desnecessárias
  const checkAuthAndFetchPosts = useCallback(async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const res = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao carregar posts");
      }

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("🔴 ERRO AO CONSULTAR POSTS:", err);
      setError(err.message);
      toast({
        title: "Erro ao carregar posts",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [user, router, toast]);

  // Efeito para carregar posts apenas quando necessário
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isMounted && user) {
        setLoading(true);
        await checkAuthAndFetchPosts();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [checkAuthAndFetchPosts]);

  const handleCreatePost = async (postData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Erro ao criar post");

      const newPost = await res.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setContent("");

      toast({
        title: "Post criado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("🔴 ERRO AO CRIAR POST:", err);
      toast({
        title: "Erro ao criar post",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePost = useCallback(async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Erro ao deletar post");
      }

      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast({
        title: "Post deletado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("🔴 ERRO AO DELETAR POST:", err);
      toast({
        title: "Erro ao deletar post",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // ❤️ Curtir um post
  const handleLike = async (postId) => {
    console.log("❤️ CURTINDO POST:", postId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        console.log("🔁 POST ATUALIZADO COM LIKE:", updated);
        setPosts((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      } else {
        const error = await res.json();
        console.error("🔴 ERRO AO CURTIR POST:", error);
        toast({
          title: "Erro ao curtir post",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("🔴 ERRO AO CURTIR POST:", err);
      toast({
        title: "Erro ao curtir post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // 🖼️ Compressão e upload de imagem
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);

      // Opções de compressão
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      };

      // Compressão da imagem
      const compressedFile = await imageCompression(file, options);

      // Criar URL para preview
      const objectUrl = URL.createObjectURL(compressedFile);
      setTempImage(compressedFile);
      setOriginalImageUrl(objectUrl);
      onOpen();

    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast({
        title: "Erro ao processar imagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }

    return false;
  };

  const onImageLoad = (image) => {
    setImageRef(image.target);
  };

  const getCroppedImg = () => {
    const image = imageRef;
    const canvas = canvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpeg';
        window.URL.revokeObjectURL(croppedImageUrl);
        setCroppedImageUrl(window.URL.createObjectURL(blob));
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  };

  const handleConfirmImage = async () => {
    try {
      const croppedImage = await getCroppedImg();

      // Opções de compressão para a imagem recortada
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true
      };

      // Compressão da imagem recortada
      const compressedCroppedImage = await imageCompression(croppedImage, options);

      setImageUrl(compressedCroppedImage);
      setImagePreviewUrl(URL.createObjectURL(compressedCroppedImage));
      onClose();
      toast({
        title: "Imagem confirmada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao recortar imagem:", error);
      toast({
        title: "Erro ao recortar imagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancelPreview = () => {
    onClose();
    setTempImage(null);
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl);
      setOriginalImageUrl(null);
    }
  };

  // 🗑️ Remover imagem
  const handleRemoveImage = () => {
    setImageUrl(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (croppedImageUrl) {
      URL.revokeObjectURL(croppedImageUrl);
      setCroppedImageUrl(null);
    }
  };

  const handleEditPost = async (postId, newContent) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!res.ok) {
        throw new Error("Erro ao editar post");
      }

      const updatedPost = await res.json();
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId ? updatedPost : post
        )
      );

      toast({
        title: "Post editado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("🔴 ERRO AO EDITAR POST:", err);
      toast({
        title: "Erro ao editar post",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg={colorMode === "light" ? "gray.50" : "gray.800"}>
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Box
            p={6}
            borderWidth="1px"
            borderRadius="lg"
            bg={colorMode === "light" ? "white" : "gray.700"}
          >
            <form onSubmit={(e) => {
              e.preventDefault();
              if (content.trim()) {
                handleCreatePost({ content });
              }
            }}>
              <VStack spacing={4}>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="O que você está pensando?"
                  resize="none"
                />
                <Button
                  type="submit"
                  colorScheme="blue"
                  isDisabled={!content.trim()}
                  alignSelf="flex-end"
                >
                  Publicar
                </Button>
              </VStack>
            </form>
          </Box>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" />
            </Center>
          ) : error ? (
            <Center py={10} flexDir="column" gap={4}>
              <Text color="red.500">{error}</Text>
              <Button
                onClick={() => {
                  setError(null);
                  checkAuthAndFetchPosts();
                }}
              >
                Tentar novamente
              </Button>
            </Center>
          ) : posts.length === 0 ? (
            <Center py={10}>
              <Text color="gray.500">Nenhum post encontrado</Text>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handleDeletePost}
                  onEdit={handleEditPost}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Modal de recorte de imagem */}
      <Modal isOpen={isOpen} onClose={handleCancelPreview} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recortar Imagem</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" align="center">
              {originalImageUrl && (
                <ReactCrop
                  src={originalImageUrl}
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onImageLoaded={onImageLoad}
                  aspect={1}
                  circularCrop={false}
                />
              )}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCancelPreview}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleConfirmImage}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
