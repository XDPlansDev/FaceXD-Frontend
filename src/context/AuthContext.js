// 📄 Caminho: context/AuthContext.js

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚡️ Verifica o token salvo ao iniciar a aplicacao
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => {
          console.log("🔄 Usuário restaurado da sessão:", data);
          setUser(data);
        })
        .catch((err) => {
          console.warn("❌ Erro ao restaurar sessão:", err.message);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✉️ Login com token JWT
  const login = (token) => {
    localStorage.setItem("token", token);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
        return res.json();
      })
      .then((data) => {
        console.log("🚀 Login realizado:", data);
        setUser(data);
      })
      .catch((err) => {
        console.error("❌ Falha no login:", err.message);
        localStorage.removeItem("token");
      });
  };

  // ❌ Logout e limpeza da sessão
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("📄 Sessão encerrada.");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Carregando...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}