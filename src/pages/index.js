// 📄 /pages/index.js

import Image from "next/image";
import Link from "next/link";
import { Button, Container, Typography, Box } from "@mui/material";

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6", // bg-gray-100
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        px: 2,
      }}
    >
      {/* Navbar */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fff",
          boxShadow: 2,
          py: 2,
          px: 3,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Image src="/logo.png" alt="Face XD Logo" width={60} height={60} priority />
      </Box>

      {/* Conteúdo principal */}
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h3" fontWeight="bold" color="text.primary">
          Face XD: A Rede Social Exclusiva para São Paulo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Face XD é uma iniciativa inovadora criada por David Xavier para promover a educação e o auto desenvolvimento.
          Conecte-se com pessoas da sua cidade e cresça pessoal e profissionalmente.
        </Typography>

        {/* Botões */}
        <Box sx={{ mt: 5, display: "flex", justifyContent: "center", gap: 2 }}>
          <Link href="/auth/login" passHref>
            <Button variant="contained" color="primary" size="large">
              Login
            </Button>
          </Link>
          <Link href="/auth/register" passHref>
            <Button variant="outlined" color="primary" size="large">
              Registrar
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
