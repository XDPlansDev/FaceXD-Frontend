// 📄 Caminho: /pages/auth/register.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
  FormErrorMessage,
  Select,
  HStack
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Head from "next/head";
import api from "@/services/api";

export default function Register() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    sexo: "",
    dataNascimento: "",
    cep: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const { register, checkUsername } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    handleChange(e);

    if (username.length >= 3) {
      setCheckingUsername(true);
      try {
        const result = await checkUsername(username);
        setUsernameAvailable(result.available);
      } catch (error) {
        console.error("Erro ao verificar nome de usuário:", error);
        setUsernameAvailable(true);
      } finally {
        setCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!usernameAvailable) {
      toast({
        title: "Erro",
        description: "Este nome de usuário já está em uso",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.sexo) {
      toast({
        title: "Erro",
        description: "Por favor, selecione seu sexo",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.dataNascimento) {
      toast({
        title: "Erro",
        description: "Por favor, informe sua data de nascimento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.cep) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu CEP",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);

      if (result.success) {
        toast({
          title: "Conta criada com sucesso!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/feed");
      } else {
        toast({
          title: "Erro ao criar conta",
          description: result.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Ocorreu um erro ao tentar criar sua conta",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await api.get("/api/auth/test");
      toast({
        title: "Conexão estabelecida",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar ao backend",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const testUsernameCheck = async () => {
    if (!formData.username) {
      toast({
        title: "Erro",
        description: "Digite um nome de usuário para testar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.get(`/api/auth/test-username/${formData.username}`);
      toast({
        title: "Teste de username",
        description: `Username: ${response.data.username}, Existe: ${response.data.exists}, Disponível: ${response.data.available}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao testar username",
        description: "Não foi possível verificar o username",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Head>
        <title>Registro | Face XD</title>
      </Head>

      <Container maxW="container.sm" py={10}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading>Crie sua conta</Heading>
            <Text color="gray.500" mt={2}>
              Comece sua jornada conosco
            </Text>
            <Button size="sm" colorScheme="teal" mt={2} onClick={testConnection}>
              Testar conexão com o backend
            </Button>
          </Box>

          <Box
            as="form"
            onSubmit={handleSubmit}
            p={8}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="lg"
          >
            <VStack spacing={4}>
              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Sobrenome</FormLabel>
                  <Input
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                    placeholder="Seu sobrenome"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired isInvalid={!usernameAvailable}>
                <FormLabel>Nome de usuário</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="Seu nome de usuário"
                />
                {checkingUsername && (
                  <Text fontSize="sm" color="gray.500">Verificando disponibilidade...</Text>
                )}
                {!usernameAvailable && !checkingUsername && (
                  <FormErrorMessage>
                    Este nome de usuário já está em uso
                  </FormErrorMessage>
                )}
                <Button size="xs" colorScheme="teal" mt={2} onClick={testUsernameCheck}>
                  Testar verificação de username
                </Button>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Seu email"
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl isRequired>
                  <FormLabel>Sexo</FormLabel>
                  <Select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    placeholder="Selecione"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Data de nascimento</FormLabel>
                  <Input
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>CEP</FormLabel>
                <Input
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  placeholder="Seu CEP"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Sua senha"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirmar senha</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme sua senha"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                width="full"
                isLoading={loading}
              >
                Criar conta
              </Button>

              <Text>
                Já tem uma conta?{" "}
                <Link href="/auth/login" color="blue.500">
                  Faça login
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </>
  );
}