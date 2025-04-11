// 📄 /pages/index.js (com Chakra UI)

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Heading,
  Text,
  Container,
  HStack,
  VStack,
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { FaArrowRight, FaSmile } from "react-icons/fa";

export default function HomePage() {
  const { user } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Conteúdo principal */}
      <Box
        as="main"
        pt="100px"
        pb="50px"
        px={5}
      >
        <Container maxW="container.md">
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Face XD: A Rede Social Exclusiva para São Paulo
            </Heading>

            <Text fontSize="xl" color={textColor}>
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
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Ir para o Feed
                    </Button>
                  </Link>
                  <Link href={`/profile/${user.username}`} passHref>
                    <Button
                      size="lg"
                      variant="outline"
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "md"
                      }}
                      transition="all 0.2s"
                    >
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
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<Icon as={FaSmile} />}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "md"
                      }}
                      transition="all 0.2s"
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
