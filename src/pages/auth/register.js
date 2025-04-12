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
  FormErrorMessage
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Head from "next/head";

export default function Register() {
  const [formData, setFormData] = useState({
    nome: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
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
      const result = await checkUsername(username);
      setUsernameAvailable(result.available);
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
              <FormControl isRequired>
                <FormLabel>Nome completo</FormLabel>
                <Input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!usernameAvailable}>
                <FormLabel>Nome de usuário</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  placeholder="Seu nome de usuário"
                />
                {!usernameAvailable && (
                  <FormErrorMessage>
                    Este nome de usuário já está em uso
                  </FormErrorMessage>
                )}
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