// Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

// 🛠️ Corrigindo os imports
import { 
  Container, Box, Paper, TextField, Button, Typography, 
  Alert, Stack, Divider, FormControlLabel, Checkbox 
} from "@mui/material";

import { FaGithub, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { login } = useAuth(); // Verifique se `useAuth` está funcionando

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (login) {
          login(data.token); // Atualiza o estado global
          router.push("/feed");
        } else {
          console.error("AuthContext não está funcionando corretamente");
        }
      } else {
        setError("Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component={Paper}
        elevation={6}
        p={4}
        mt={8}
        borderRadius={3}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Entrar
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Conecte-se à sua conta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} width="100%" mb={2}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FaGithub />}
            sx={{ textTransform: "none" }}
          >
            GitHub
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FaGoogle />}
            sx={{ textTransform: "none" }}
          >
            Google
          </Button>
        </Stack>

        <Divider sx={{ width: "100%", my: 2 }}>Ou com e-mail</Divider>

        <Box component="form" onSubmit={handleLogin} width="100%">
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormControlLabel control={<Checkbox />} label="Lembrar de mim" />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ textTransform: "none", py: 1.5 }}
            >
              Entrar
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
