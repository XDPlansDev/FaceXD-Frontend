// 📄 /pages/index.js (com Chakra UI)

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Container,
  HStack,
  VStack,
  Icon
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { FaArrowRight, FaSmile } from "react-icons/fa";

export default function HomePage() {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <Box minH="100vh">
      {/* Cabeçalho */}
      <Box
        as="header"
        bg="white"
        boxShadow="0 2px 8px #f0f1f2"
        py={4}
        position="fixed"
        width="100%"
        zIndex={10}
      >
        <Flex justify="center" align="center">
          <Image src="/logo.png" alt="Face XD Logo" width={60} height={60} priority />
        </Flex>
      </Box>

      {/* Conteúdo principal */}
      <Box
        as="main"
        pt="100px"
        pb="50px"
        px={5}
        bg="gray.50"
      >
        <Container maxW="container.md">
          <VStack spacing={8} textAlign="center">
            <Heading as="h1" size="2xl" fontWeight="bold">
              Face XD: A Rede Social Exclusiva para São Paulo
            </Heading>

            <Text fontSize="xl" color="gray.600">
              Face XD é uma iniciativa inovadora criada por <strong>David Xavier</strong> para promover a educação e o auto desenvolvimento.<br />
              Conecte-se com pessoas da sua cidade e cresça pessoal e profissionalmente.
            </Text>

            <HStack spacing={6} mt={8}>
              {isLoggedIn && user ? (
                <>
                  <Link href="/feed" passHref>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      rightIcon={<Icon as={FaArrowRight} />}
                    >
                      Ir para o Feed
                    </Button>
                  </Link>
                  <Link href={`/profile/${user.username}`} passHref>
                    <Button size="lg" variant="outline">
                      Meu Perfil
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" passHref>
                    <Button
                      colorScheme="blue"
                      size="lg"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<Icon as={FaSmile} />}
                    >
                      Registrar
                    </Button>
                  </Link>
                </>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
