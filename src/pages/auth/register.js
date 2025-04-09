import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container, Box, Paper, TextField, Button, Typography,
  Alert, Stack, Divider, MenuItem, FormControl, InputLabel, Select,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "@/utils/firebase";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        nome,
        sobrenome,
        username,
        cep,
        sexo,
        dataNascimento,
        createdAt: new Date().toISOString(),
        followers: [],
        following: [],
        favoritos: []
      });

      setOpenDialog(true);
    } catch (err) {
      console.error("Erro ao registrar:", err);
      setError("Erro ao registrar. Verifique os dados e tente novamente.");
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica se já existe no Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        nome: user.displayName?.split(" ")[0] || "",
        sobrenome: user.displayName?.split(" ").slice(1).join(" ") || "",
        username: user.email.split("@")[0],
        cep: "",
        sexo: "",
        dataNascimento: "",
        createdAt: new Date().toISOString(),
        followers: [],
        following: [],
        favoritos: []
      }, { merge: true });

      router.push("/feed");
    } catch (err) {
      console.error("Erro no login com Google:", err);
      setError("Erro ao registrar com Google.");
    }
  };

  const handleRedirect = (path) => {
    setOpenDialog(false);
    router.push(path);
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
              label="Username"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              helperText="Escolha um nome único para o seu perfil"
            />
            <Stack direction="row" spacing={2}>
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
            </Stack>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormControl fullWidth required>
              <InputLabel id="sexo-label">Sexo</InputLabel>
              <Select
                labelId="sexo-label"
                value={sexo}
                label="Sexo"
                onChange={(e) => setSexo(e.target.value)}
              >
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Data de Nascimento"
              type="date"
              fullWidth
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              InputLabelProps={{ shrink: true }}
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

        <Divider sx={{ width: "100%", my: 2 }}>ou</Divider>

        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={handleGoogleRegister}
          sx={{ textTransform: "none", py: 1.3 }}
        >
          Continuar com Google
        </Button>

        <Typography color="text.secondary" mt={2}>
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

      {/* Dialog de Sucesso */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🎉 Cadastro Realizado com Sucesso!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bem-vindo, <strong>{nome}</strong>, ao <strong>Face XD</strong>! <br />
            Escolha para onde deseja ir:
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleRedirect("/")} variant="contained" color="primary">
            Feed
          </Button>
          <Button onClick={() => handleRedirect("/profile")} variant="outlined">
            Perfil
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
