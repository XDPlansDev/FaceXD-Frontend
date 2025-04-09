import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PostCard({ post, onLike }) {
  const [likes, setLikes] = useState(post.likes || 0);

  const handleLike = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${post._id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setLikes(likes + 1);
        onLike();
      } else {
        console.error("Erro ao curtir post");
      }
    } catch (error) {
      console.error("Erro na requisição de curtida", error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      {/* Nome do autor */}
      <h4 className="text-sm text-gray-500 mb-1">
        {post.userId?.nome || "Anônimo"}
      </h4>

      <h3 className="text-lg font-bold">{post.title}</h3>
      <p className="text-gray-700 mt-2">{post.content}</p>

      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleLike}
          className="text-blue-500 hover:underline"
        >
          Curtir
        </button>
        <span className="text-gray-600">{likes} curtidas</span>
      </div>
    </div>
  );
}
