// 📄 /pages/feed.js

import { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Avatar,
  List,
  Typography,
  Upload,
  message,
  Spin,
  Divider,
  Space,
  Tooltip,
  Modal
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  CommentOutlined,
  PictureOutlined,
  UserOutlined
} from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const { TextArea } = Input;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
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
      message.error("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  };

  // 📬 Cria um novo post
  const handleCreatePost = async () => {
    if (!content.trim()) {
      message.warning("Adicione um texto para publicar");
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
        message.success("Post criado com sucesso!");
      } else {
        const error = await res.json();
        console.error("🔴 ERRO AO CRIAR POST:", error);
        message.error("Erro ao criar post");
      }
    } catch (err) {
      console.error("🔴 ERRO AO CRIAR POST:", err);
      message.error("Erro ao criar post");
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
        message.error("Erro ao curtir post");
      }
    } catch (err) {
      console.error("🔴 ERRO AO CURTIR POST:", err);
      message.error("Erro ao curtir post");
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
      setPreviewVisible(true);

    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      message.error("Erro ao processar imagem");
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
      setPreviewVisible(false);
      message.success("Imagem confirmada com sucesso!");
    } catch (error) {
      console.error("Erro ao recortar imagem:", error);
      message.error("Erro ao recortar imagem");
    }
  };

  const handleCancelPreview = () => {
    setPreviewVisible(false);
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
    <div className="max-w-2xl mx-auto p-6">
      <Typography.Title level={2} className="mb-8">
        Feed
      </Typography.Title>

      {/* Formulário para novo post */}
      <Card className="mb-8 shadow-sm">
        <TextArea
          placeholder="O que você está pensando hoje?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          className="mb-6"
        />

        <Space direction="vertical" size="large" className="w-full">
          {imageUrl && (
            <div className="relative inline-block">
              <img
                src={croppedImageUrl}
                alt="Preview"
                className="w-[70px] h-[70px] object-cover rounded-lg"
              />
              <Button
                type="text"
                danger
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2"
              >
                Remover
              </Button>
            </div>
          )}

          <Space className="w-full justify-between">
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              disabled={true}
            >
              <Button
                icon={<PictureOutlined />}
                disabled={true}
                className="hover:bg-gray-50 opacity-50 cursor-not-allowed"
              >
                Adicionar Imagem (Em breve)
              </Button>
            </Upload>

            <Button
              type="primary"
              onClick={handleCreatePost}
              disabled={!content.trim()}
              size="large"
            >
              Publicar
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Modal de Preview da Imagem */}
      <Modal
        open={previewVisible}
        title="Recortar Imagem"
        onOk={handleConfirmImage}
        onCancel={handleCancelPreview}
        okText="Confirmar"
        cancelText="Cancelar"
        width={800}
        destroyOnClose={true}
      >
        <div className="flex flex-col items-center">
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
        </div>
      </Modal>

      {/* Lista de posts */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Spin size="large" />
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-8">
          <Typography.Text className="text-gray-500">
            Nenhum post ainda. Seja o primeiro a publicar!
          </Typography.Text>
        </Card>
      ) : (
        <List
          itemLayout="vertical"
          dataSource={posts}
          renderItem={(post) => (
            <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
              <List.Item
                actions={[
                  <Tooltip title="Curtir">
                    <Button
                      type="text"
                      icon={post.likes?.includes(localStorage.getItem("userId")) ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
                      onClick={() => handleLike(post._id)}
                    >
                      {post.likes?.length || 0}
                    </Button>
                  </Tooltip>,
                  <Tooltip title="Comentar">
                    <Button
                      type="text"
                      icon={<CommentOutlined />}
                      disabled
                    >
                      {post.comments?.length || 0}
                    </Button>
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      src={post.userId?.avatar}
                      icon={<UserOutlined />}
                      size="large"
                    />
                  }
                  title={<span className="font-medium">{post.userId?.nome || "Anônimo"}</span>}
                  description={
                    <Typography.Paragraph className="mt-2">
                      {post.content}
                    </Typography.Paragraph>
                  }
                />

                {post.image && (
                  <div className="mt-4">
                    <img
                      src={post.image}
                      alt="Post"
                      className="max-h-96 w-full object-contain rounded-lg"
                    />
                  </div>
                )}
              </List.Item>
            </Card>
          )}
        />
      )}
    </div>
  );
}
