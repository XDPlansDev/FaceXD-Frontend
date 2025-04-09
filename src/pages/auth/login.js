// 📄 Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Container, Box, Paper, TextField, Button,
  Typography, Alert, Stack
} from "@mui/material";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token); // Armazena token no contexto
        console.log(`✅ Login com @${data.user.username}`);
        router.push("/feed");
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
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

        <Typography color="text.secondary" mb={3}>
          Faça login com e-mail e senha.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} width="100%">
          <Stack spacing={2}>
            <TextField
              label="E-mail ou Username"
              fullWidth
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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

        <Typography mt={3} color="text.secondary">
          Não tem uma conta?{" "}
          <Link href="/auth/register" passHref>
            <Button variant="text" size="small">Registrar</Button>
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
