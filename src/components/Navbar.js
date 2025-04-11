// 📄 /components/Navbar.js

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  HStack,
  Icon,
  Heading,
  useColorMode,
  IconButton,
  Badge,
  Tooltip,
  useToast,
  Container,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Divider
} from "@chakra-ui/react";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaSearch,
  FaMoon,
  FaSun,
  FaBell,
  FaBars,
  FaNewspaper,
  FaUsers
} from "react-icons/fa";
import SearchUser from "./SearchUser";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState(3); // Simulação de notificações

  useEffect(() => {
    setMounted(true);
    console.log("Navbar montado com sucesso");
  }, []);

  const handleLogout = async () => {
    try {
      console.log("Iniciando processo de logout");
      await logout();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/auth/login");
    } catch (error) {
      console.error("Erro durante logout:", error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar sair",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!mounted) return null;

  return (
    <Box
      as="header"
      bg={colorMode === "light" ? "white" : "gray.800"}
      px={4}
      py={2}
      boxShadow="lg"
      position="fixed"
      width="100%"
      zIndex={10}
      transition="all 0.3s ease-in-out"
    >
      <Container maxW="1200px">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          height="100%"
        >
          {/* Logo e Menu Mobile */}
          <HStack spacing={4}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<FaBars />}
              variant="ghost"
              onClick={onOpen}
              aria-label="Menu"
            />
            <Link href="/">
              <HStack spacing={2} cursor="pointer" _hover={{ transform: "scale(1.05)" }} transition="all 0.2s">
                <Image src="/logo.png" alt="Face XD Logo" width={40} height={40} priority />
                <Heading
                  as="h4"
                  size="md"
                  bgGradient="linear(to-r, blue.400, purple.500)"
                  bgClip="text"
                >
                  Face XD
                </Heading>
              </HStack>
            </Link>
          </HStack>

          {/* Menu Desktop */}
          <HStack spacing={6} display={{ base: "none", md: "flex" }}>
            {user && (
              <>
                <Link href="/feed">
                  <Button
                    variant="ghost"
                    leftIcon={<Icon as={FaHome} />}
                    _hover={{ bg: "blue.50" }}
                  >
                    Feed
                  </Button>
                </Link>
                <SearchUser />
              </>
            )}
          </HStack>

          {/* Ações do Usuário */}
          <HStack spacing={4}>
            <Tooltip label={`Modo ${colorMode === "light" ? "Escuro" : "Claro"}`}>
              <IconButton
                icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Alternar tema"
              />
            </Tooltip>

            {user ? (
              <HStack spacing={4}>
                <Tooltip label="Notificações">
                  <Box position="relative">
                    <IconButton
                      icon={<FaBell />}
                      variant="ghost"
                      aria-label="Notificações"
                    />
                    {notifications > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-1"
                        right="-1"
                        borderRadius="full"
                      >
                        {notifications}
                      </Badge>
                    )}
                  </Box>
                </Tooltip>

                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    rightIcon={
                      <Avatar
                        size="sm"
                        name={user.username}
                        src={user.avatar}
                        bg="blue.500"
                      >
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                    }
                  >
                    <Text fontWeight={500}>{user.username}</Text>
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<Icon as={FaUser} />} as={Link} href={`/profile/${user?.username}`}>
                      Meu Perfil
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaNewspaper} />} as={Link} href="/feed">
                      Meus Posts
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaUsers} />} as={Link} href="/friends">
                      Amigos
                    </MenuItem>
                    <MenuItem icon={<Icon as={FaCog} />} as={Link} href="/profile/settings">
                      Configurações
                    </MenuItem>
                    <Divider />
                    <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={handleLogout}>
                      Sair
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <HStack spacing={4}>
                <Link href="/auth/login">
                  <Button variant="outline" colorScheme="blue">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button colorScheme="blue" bgGradient="linear(to-r, blue.400, purple.500)">
                    Registrar
                  </Button>
                </Link>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Container>

      {/* Menu Mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {user && (
                <>
                  <Link href="/feed">
                    <Button
                      leftIcon={<Icon as={FaHome} />}
                      variant="ghost"
                      width="100%"
                      justifyContent="flex-start"
                    >
                      Feed
                    </Button>
                  </Link>
                  <SearchUser />
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
