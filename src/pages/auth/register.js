import { useState } from "react";
import { useRouter } from "next/router";

// Importando componentes do Material UI
import { 
  Container, Box, Paper, TextField, Button, Typography, 
  Alert, Stack, Divider 
} from "@mui/material";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("https://facexd-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, sobrenome, telefone, email, cep, password }),
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        const data = await response.json();
        setError(data.message || "Erro ao registrar usuário.");
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
          Criar Conta
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Preencha os campos abaixo para criar sua conta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleRegister} width="100%">
          <Stack spacing={2}>
            <TextField
              label="Nome"
              fullWidth
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              label="Sobrenome"
              fullWidth
              required
              value={sobrenome}
              onChange={(e) => setSobrenome(e.target.value)}
            />
            <TextField
              label="Telefone (Opcional)"
              fullWidth
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="CEP"
              fullWidth
              required
              value={cep}
              onChange={(e) => setCep(e.target.value)}
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
              color="primary"
              fullWidth
              sx={{ textTransform: "none", py: 1.5 }}
            >
              Criar Conta
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ width: "100%", my: 2 }} />

        <Typography color="text.secondary">
          Já tem cadastro?{" "}
          <Button
            variant="text"
            color="primary"
            onClick={() => router.push("/auth/login")}
            sx={{ textTransform: "none", fontWeight: "bold" }}
          >
            Faça seu login
          </Button>
        </Typography>
      </Box>
    </Container>
  );
}
