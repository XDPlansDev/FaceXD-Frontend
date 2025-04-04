// Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { FaGithub, FaGoogle } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        router.push("/feed");
      } else {
        setError("Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900">Entrar</h2>
        <p className="text-gray-500 text-center mb-6">Conecte-se à sua conta</p>
        
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <div className="flex space-x-4 mb-4">
          <button className="flex items-center justify-center w-1/2 px-4 py-2 border rounded-lg hover:bg-gray-100">
            <FaGithub className="mr-2" /> GitHub
          </button>
          <button className="flex items-center justify-center w-1/2 px-4 py-2 border rounded-lg hover:bg-gray-100">
            <FaGoogle className="mr-2" /> Google
          </button>
        </div>

        <div className="text-gray-400 text-center mb-4">Ou faça login com seu e-mail</div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <div className="flex items-center">
            <input type="checkbox" id="remember" className="mr-2" />
            <label htmlFor="remember" className="text-gray-600 text-sm">Lembrar de mim</label>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}