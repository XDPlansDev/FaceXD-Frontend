// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { Spinner, Center, Box } from "@chakra-ui/react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
          console.log("🔄 Sessão restaurada:", data);
          setUser(data);
        })
        .catch((err) => {
          console.warn("❌ Erro na sessão:", err.message);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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
        console.log("🚀 Login efetuado:", data);
        setUser(data);
      })
      .catch((err) => {
        console.error("❌ Falha ao logar:", err.message);
        localStorage.removeItem("token");
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    console.log("👋 Logout efetuado.");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {loading ? (
        <Center h="100vh">
          <Box textAlign="center">
            <Spinner size="xl" />
            <Box mt={4}>Carregando usuário...</Box>
          </Box>
        </Center>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
