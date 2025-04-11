// 📄 Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Spinner,
  useToast
} from "@chakra-ui/react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        console.log(`✅ Login com @${data.user.username}`);
        router.push("/feed");
      } else {
        setError("Usuário ou senha inválidos.");
        console.warn("⚠️ Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
      console.error("❌ Erro ao conectar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="400px" mx="auto" p="2rem">
      <Card>
        <CardBody>
          <VStack spacing={6} width="100%">
            <Heading as="h3" size="lg" textAlign="center">
              Entrar
            </Heading>
            <Text color="gray.500" textAlign="center">
              Faça login com e-mail e senha.
            </Text>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={handleLogin} width="100%">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>E-mail ou Username</FormLabel>
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    isDisabled={loading}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Senha</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isDisabled={loading}
                  />
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  isLoading={loading}
                  isDisabled={!identifier || !password}
                >
                  Entrar
                </Button>
              </VStack>
            </Box>

            <Text color="gray.500" textAlign="center">
              Não tem uma conta?{' '}
              <Link href="/auth/register" passHref>
                <Button as="a" variant="link" size="sm" colorScheme="blue">
                  Registrar
                </Button>
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
