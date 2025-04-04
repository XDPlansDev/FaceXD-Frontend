// Caminho: /components/CreatePostForm.js

import { useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function CreatePostForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onCreate({ title, content });
      setTitle("");
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white shadow rounded-lg">
      <h2 className="text-lg font-bold mb-2">Criar Post</h2>
      <Input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Escreva algo..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" className="mt-2">Publicar</Button>
    </form>
  );
}
