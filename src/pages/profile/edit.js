// Caminho: /pages/profile/edit.js
// --------------------------------------------------------------
// Explicação Geral:
// 1. Esta página separada permite a edição de perfil fora do modal.
// 2. Agora usamos a variável de ambiente NEXT_PUBLIC_API_URL para
//    evitar escrever "http://localhost:5000" diretamente no código.
// 3. Trocamos "name" por "nome" e adicionamos "sobrenome".
// --------------------------------------------------------------

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditProfilePage() {
  // Estados para armazenar nome, sobrenome e email
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Pega o router do Next.js para redirecionar após salvar
  const router = useRouter();
  
  // Captura a URL base do backend definida em .env.local
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  // Ex: NEXT_PUBLIC_API_URL=http://localhost:5000
  
  // useEffect para buscar os dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
<<<<<<< HEAD
        const response = await fetch(`${API_URL}/api/users/me`, {
=======
        const response = await fetch(`${BASE_URL}/api/users/me`, {
>>>>>>> 7204ea42d70035ae0d389f5012937f74f7f9ed1c
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
<<<<<<< HEAD
          console.log("🔍 Dados carregados:", data);
          setName(data.name);
=======
          setNome(data.nome);
          setSobrenome(data.sobrenome);
>>>>>>> 7204ea42d70035ae0d389f5012937f74f7f9ed1c
          setEmail(data.email);
        } else {
          alert("Erro ao carregar perfil");
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [BASE_URL]);
  
  // Função para salvar alterações no perfil
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
<<<<<<< HEAD
      const response = await fetch(`${API_URL}/api/users/me`, {
=======
      const response = await fetch(`${BASE_URL}/api/users/me`, {
>>>>>>> 7204ea42d70035ae0d389f5012937f74f7f9ed1c
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nome, sobrenome, email })
      });
      
      if (response.ok) {
        alert("Perfil atualizado com sucesso!");
<<<<<<< HEAD
        router.push("/profile");
=======
        // Redireciona para o perfil do usuário; se tiver o username, use: /profile/{username}
        // ou, se for o caso, /feed ou onde preferir
        router.push("/profile/me");
>>>>>>> 7204ea42d70035ae0d389f5012937f74f7f9ed1c
      } else {
        alert("Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };
  
  // Renderização da página
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="p-6 bg-white shadow rounded-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Editar Perfil</h2>
        {loading ? (
          <p className="text-gray-500">Carregando...</p>
        ) : (
          <>
            <input
              type="text"
              placeholder="Nome"
              className="w-full p-2 mb-2 border rounded"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="text"
              placeholder="Sobrenome"
              className="w-full p-2 mb-2 border rounded"
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-4 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              onClick={handleSave}
            >
              Salvar
            </button>
          </>
        )}
      </div>
    </div>
  );
}