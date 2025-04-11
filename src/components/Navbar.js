// 📄 /components/Navbar.js

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Heading
} from "@chakra-ui/react";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaSearch
} from "react-icons/fa";
import SearchUser from "./SearchUser"; // 🆕 Importa o componente de busca

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <Box
      as="header"
      bg="white"
      px={6}
      py={0}
      boxShadow="0 2px 8px #f0f1f2"
      position="fixed"
      width="100%"
      zIndex={10}
    >
      <Flex
        maxW="1200px"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        height="100%"
      >
        {/* Logo, Feed e Busca */}
        <HStack spacing={6} align="center">
          <Link href="/">
            <Heading as="h4" size="md" color="blue.500" m={0}>
              Face XD
            </Heading>
          </Link>
          {user && (
            <>
              <Link href="/feed">
                <Button variant="ghost" leftIcon={<Icon as={FaHome} />}>
                  Feed
                </Button>
              </Link>
              <SearchUser /> {/* 🆕 Componente de busca aqui */}
            </>
          )}
        </HStack>

        {/* Perfil / Login */}
        {user ? (
          <Menu>
            <MenuButton as={Button} variant="ghost" rightIcon={<Avatar size="sm">{user.username?.[0]?.toUpperCase() || "U"}</Avatar>}>
              <Text fontWeight={500}>{user.username}</Text>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={FaUser} />} as={Link} href={`/profile/${user?.username}`}>
                Meu Perfil
              </MenuItem>
              <MenuItem icon={<Icon as={FaCog} />} as={Link} href="/profile/settings">
                Configurações
              </MenuItem>
              <MenuItem icon={<Icon as={FaSignOutAlt} />} onClick={logout}>
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <HStack spacing={4}>
            <Link href="/auth/login">
              <Button variant="outline">Entrar</Button>
            </Link>
            <Link href="/auth/register">
              <Button colorScheme="blue">Registrar</Button>
            </Link>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
