// 📄 Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Container, Box, Paper, TextField, Button,
  Typography, Alert, Stack
} from "@mui/material";
import Link from "next/link";

// Firebase imports
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import app from "@/utils/firebase"; // Firebase inicializado
import GoogleIcon from "@mui/icons-material/Google";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const auth = getAuth(app);
    const db = getFirestore(app);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      const sessionData = {
        uid: user.uid,
        email: user.email,
        ...userData,
      };

      login(sessionData);
      console.log(`✅ Login com @${userData.username || user.email}`);
      router.push("/feed");
    } catch (err) {
      console.error("Erro ao fazer login:", err.message);
      setError("E-mail ou senha incorretos.");
    }
  };

  const handleGoogleLogin = async () => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData = {};

      if (!userDoc.exists()) {
        userData = {
          username: user.email.split("@")[0],
          nome: user.displayName || "",
          email: user.email,
          avatar: user.photoURL,
          sexo: "",
          nascimento: "",
          seguidores: [],
          favoritos: [],
          criadoEm: new Date(),
        };
        await setDoc(userDocRef, userData);
      } else {
        userData = userDoc.data();
      }

      const sessionData = {
        uid: user.uid,
        email: user.email,
        ...userData,
      };

      login(sessionData);
      console.log(`✅ Login com Google: @${userData.username}`);
      router.push("/feed");
    } catch (err) {
      console.error("Erro ao logar com Google:", err.message);
      setError("Não foi possível entrar com o Google.");
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
          Faça login com e-mail ou Google. O acesso será mantido por <strong>7 dias</strong>.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} width="100%">
          <Stack spacing={2}>
            <TextField
              label="E-mail"
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

            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{ textTransform: "none", py: 1.5 }}
            >
              Entrar com Google
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
