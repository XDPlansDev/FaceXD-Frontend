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
    try {
      await api.get(`/api/auth/check-username/${username}`);
      return { available: true };
    } catch (error) {
      return { available: false };
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
