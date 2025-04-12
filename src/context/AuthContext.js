// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { Spinner, Center, Box } from "@chakra-ui/react";
import api from "@/services/api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/api/auth/me")
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer login"
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/api/auth/register", userData);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao registrar"
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const checkUsername = async (username) => {
    console.log("Verificando username:", username);
    try {
      // Usando a rota original
      const response = await api.get(`/api/auth/check-username/${username}`);
      console.log("Resposta da API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar nome de usuário:", error);
      console.error("Detalhes do erro:", error.response?.data);

      // Se o erro for 400 (Bad Request), provavelmente é um username inválido
      if (error.response?.status === 400) {
        return { available: false };
      }

      // Para outros erros, assumimos que o username está disponível
      return { available: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUsername }}>
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
