// 📄 Caminho: /pages/auth/register.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Container
} from "@chakra-ui/react";

export default function RegisterPage() {
  // ✔️ Estados do formulário
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState({ available: null, suggestions: [] });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // ⏳ Loader

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Inicia o loader

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          sobrenome,
          username,
          email,
          cep,
          password,
          dataNascimento,
          sexo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Cadastro realizado:", data);
        // ✉️ Armazena o token e redireciona para o feed
        localStorage.setItem("token", data.token);
        onOpen();
      } else {
        setError(data.message || "Erro ao registrar usuário.");
      }
    } catch (err) {
      console.error("❌ Erro ao conectar com o servidor:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = (path) => {
    onClose();
    router.push(path);
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ available: null, suggestions: [] });
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-username/${username}`);
      const data = await response.json();
      setUsernameStatus(data);
    } catch (err) {
      console.error("Erro ao verificar username:", err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounce para evitar muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  return (
    <Container maxW="sm">
      <Box
        bg="white"
        boxShadow="lg"
        p={6}
        mt={8}
        borderRadius="lg"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Heading as="h5" size="lg" fontWeight="bold" mb={2}>
          Criar Conta
        </Heading>
        <Text color="gray.500" mb={4}>
          Preencha os campos abaixo para criar sua conta
        </Text>

        {error && (
          <Alert status="error" borderRadius="md" width="100%" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box as="form" onSubmit={handleRegister} width="100%">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Escolha um nome único para o seu perfil"
                isInvalid={usernameStatus.available === false}
              />
              {isCheckingUsername && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Verificando disponibilidade...
                </Text>
              )}
              {usernameStatus.available === true && (
                <Text fontSize="sm" color="green.500" mt={1}>
                  ✓ Username disponível
                </Text>
              )}
              {usernameStatus.available === false && (
                <Box mt={1}>
                  <Text fontSize="sm" color="red.500">
                    ✗ Username já está em uso
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Sugestões disponíveis:
                  </Text>
                  <VStack align="start" spacing={1} mt={1}>
                    {usernameStatus.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        onClick={() => setUsername(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              )}
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl isRequired>
                <FormLabel>Nome</FormLabel>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Sobrenome</FormLabel>
                <Input
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                />
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Sexo</FormLabel>
              <Select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                placeholder="Selecione"
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Data de Nascimento</FormLabel>
              <Input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>CEP</FormLabel>
              <Input
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              py={6}
              isLoading={loading}
              loadingText="Criando conta..."
            >
              Criar Conta
            </Button>
          </VStack>
        </Box>

        <Divider my={4} width="100%" />

        <Text color="gray.500">
          Já tem cadastro?{" "}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => router.push("/auth/login")}
            fontWeight="bold"
          >
            Faça seu login
          </Button>
        </Text>
      </Box>

      {/* Modal de Sucesso */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>🎉 Cadastro Realizado com Sucesso!</ModalHeader>
          <ModalBody>
            <Text>
              Bem-vindo, <strong>{nome}</strong>, ao <strong>Face XD</strong>! <br />
              Escolha para onde deseja ir:
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => handleRedirect("/")}>
              Feed
            </Button>
            <Button variant="outline" onClick={() => handleRedirect("/profile")}>
              Perfil
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}