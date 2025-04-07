import {
  Avatar,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PostCard from "@/components/PostCard";
import CreatePostForm from "@/components/CreatePostForm";
import EditProfileForm from "@/components/EditProfileForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar perfil");
      const data = await res.json();
      console.log("👤 Perfil carregado:", data);
      setUser(data);
    } catch (err) {
      console.error("Erro na requisição de perfil:", err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts/user/${id}`);
      if (!res.ok) throw new Error("Erro ao carregar posts");
      const data = await res.json();
      console.log("📝 Posts carregados:", data);
      setPosts(data);
    } catch (err) {
      console.error("Erro na requisição de posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (newPost) => {
    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newPost,
          userId: id,
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar post");
      console.log("✅ Post criado com sucesso");
      fetchUserPosts();
    } catch (err) {
      console.error("❌ Erro ao criar post:", err);
    }
  };

  if (loading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="mt-6">
      <Card className="p-4 mb-6">
        <CardContent className="flex items-center">
          <Avatar
            src={user?.avatar || "/default-avatar.png"}
            sx={{ width: 80, height: 80, marginRight: 2 }}
          />
          <div>
            <Typography variant="h5" className="font-bold">
              {user?.name}
            </Typography>
            <Typography variant="subtitle2" className="text-blue-600">
              @{user?.nickname || user?.username || "sem-nickname"}
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {user?.bio || "Este usuário ainda não escreveu uma bio."}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              className="mt-2"
              onClick={() => setEditOpen(true)}
            >
              Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreatePostForm onCreate={handleCreatePost} />

      <Typography variant="h6" className="font-bold mb-4">
        Posts
      </Typography>
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard key={post._id} post={post} onLike={() => {}} />
        ))
      ) : (
        <Typography variant="body2" className="text-gray-500">
          Este usuário ainda não publicou nenhum post.
        </Typography>
      )}

      {/* Modal de edição */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Editar Perfil
          <IconButton
            onClick={() => setEditOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <EditProfileForm onClose={() => {
            setEditOpen(false);
            fetchUserProfile(); // Atualiza perfil após editar
          }} />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
