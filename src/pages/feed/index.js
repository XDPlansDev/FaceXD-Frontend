// 📄 /pages/feed.js

import { useState, useEffect, useRef } from "react";
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
  Badge
} from "@chakra-ui/react";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaImage,
  FaUser,
  FaTrash
} from "react-icons/fa";
import imageCompression from "browser-image-compression";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
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

  // 🔄 Carrega os posts
  useEffect(() => {
    console.log("🟡 CONSULTANDO POSTS...");
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log("🟢 POSTS RECEBIDOS:", data);
      setPosts(data || []);
    } catch (err) {
      console.error("🔴 ERRO AO CONSULTAR POSTS:", err);
      toast({
        title: "Erro ao carregar posts",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 📬 Cria um novo post
  const handleCreatePost = async () => {
    if (!content.trim()) {
      toast({
        title: "Adicione um texto para publicar",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log("📨 ENVIANDO NOVO POST:", content);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", content);

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const newPost = await res.json();
        console.log("✅ POST CRIADO:", newPost);
        setPosts([newPost, ...posts]);
        setContent("");
        toast({
          title: "Post criado com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await res.json();
        console.error("🔴 ERRO AO CRIAR POST:", error);
        toast({
          title: "Erro ao criar post",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("🔴 ERRO AO CRIAR POST:", err);
      toast({
        title: "Erro ao criar post",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpeg';
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
      setCroppedImageUrl(URL.createObjectURL(compressedCroppedImage));
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

  return (
    <Box maxW="2xl" mx="auto" p={6}>
      <Heading as="h2" size="lg" mb={8}>
        Feed
      </Heading>

      {/* Formulário para novo post */}
      <Card mb={8} shadow="sm">
        <CardBody>
          <Textarea
            placeholder="O que você está pensando hoje?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minH="100px"
            mb={6}
            resize="vertical"
          />

          <VStack spacing={4} align="stretch">
            {imageUrl && (
              <Box position="relative" display="inline-block">
                <Image
                  src={croppedImageUrl}
                  alt="Preview"
                  w="70px"
                  h="70px"
                  objectFit="cover"
                  borderRadius="lg"
                />
                <IconButton
                  icon={<FaTrash />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  position="absolute"
                  top="-2"
                  right="-2"
                  onClick={handleRemoveImage}
                  aria-label="Remover imagem"
                />
              </Box>
            )}

            <Flex justify="space-between" align="center">
              <Button
                leftIcon={<FaImage />}
                isDisabled={true}
                opacity={0.5}
                cursor="not-allowed"
                variant="outline"
              >
                Adicionar Imagem (Em breve)
              </Button>

              <Button
                colorScheme="blue"
                onClick={handleCreatePost}
                isDisabled={!content.trim()}
                size="lg"
              >
                Publicar
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* Modal de Preview da Imagem */}
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

      {/* Lista de posts */}
      {loading ? (
        <Flex justify="center" my={8}>
          <Spinner size="xl" />
        </Flex>
      ) : posts.length === 0 ? (
        <Card textAlign="center" py={8}>
          <Text color="gray.500">
            Nenhum post ainda. Seja o primeiro a publicar!
          </Text>
        </Card>
      ) : (
        <VStack spacing={6} align="stretch">
          {posts.map((post) => (
            <Card key={post._id} mb={6} shadow="sm" _hover={{ shadow: "md" }} transition="all 0.2s">
              <CardHeader>
                <Flex align="center">
                  <Avatar
                    src={post.userId?.avatar}
                    icon={<FaUser />}
                    size="lg"
                    mr={3}
                  />
                  <Box>
                    <Text fontWeight="medium">{post.userId?.nome || "Anônimo"}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>
                </Flex>
              </CardHeader>
              <CardBody>
                <Text mb={4}>{post.content}</Text>
                {post.image && (
                  <Box mt={4}>
                    <Image
                      src={post.image}
                      alt="Post"
                      maxH="24rem"
                      w="full"
                      objectFit="contain"
                      borderRadius="lg"
                    />
                  </Box>
                )}
              </CardBody>
              <CardFooter>
                <HStack spacing={4}>
                  <Tooltip label="Curtir">
                    <Button
                      variant="ghost"
                      leftIcon={post.likes?.includes(localStorage.getItem("userId")) ?
                        <FaHeart color="red" /> :
                        <FaRegHeart />
                      }
                      onClick={() => handleLike(post._id)}
                    >
                      {post.likes?.length || 0}
                    </Button>
                  </Tooltip>
                  <Tooltip label="Comentar">
                    <Button
                      variant="ghost"
                      leftIcon={<FaComment />}
                      isDisabled
                    >
                      {post.comments?.length || 0}
                    </Button>
                  </Tooltip>
                </HStack>
              </CardFooter>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
}
