// 📄 /components/Navbar.js

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
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
  Divider,
  MenuItemOption,
  MenuOptionGroup,
  MenuDivider,
  Spinner,
  Center
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
  FaUsers,
  FaCheck,
  FaTrash
} from "react-icons/fa";
import SearchUser from "./SearchUser";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useDisclosure();

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

  const handleNotificationClick = async (notification) => {
    // Marcar como lida
    await markAsRead(notification._id);

    // Navegar com base no tipo de notificação
    switch (notification.type) {
      case "friend_request":
      case "friend_accepted":
        router.push(`/profile/${notification.sender.username}`);
        break;
      case "post_like":
      case "post_comment":
        router.push(`/feed/${notification.relatedId}`);
        break;
      case "follow":
        router.push(`/profile/${notification.sender.username}`);
        break;
      default:
        break;
    }

    onNotificationsClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast({
      title: "Notificações marcadas como lidas",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    toast({
      title: "Notificação excluída",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewAllNotifications = () => {
    onNotificationsClose();
    router.push("/notifications");
  };

  const handleNotificationsOpen = () => {
    fetchNotifications();
    onNotificationsOpen();
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
                      onClick={handleNotificationsOpen}
                    />
                    {unreadCount > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-1"
                        right="-1"
                        borderRadius="full"
                      >
                        {unreadCount}
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
                    <MenuItem icon={<Icon as={FaBell} />} as={Link} href="/notifications">
                      Notificações
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
                  <Link href="/notifications">
                    <Button
                      leftIcon={<Icon as={FaBell} />}
                      variant="ghost"
                      width="100%"
                      justifyContent="flex-start"
                    >
                      Notificações
                      {unreadCount > 0 && (
                        <Badge ml={2} colorScheme="red">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <SearchUser />
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Menu de Notificações */}
      <Drawer isOpen={isNotificationsOpen} placement="right" onClose={onNotificationsClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>Notificações</Text>
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  leftIcon={<FaCheck />}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            {loading ? (
              <Center py={10}>
                <Spinner size="xl" />
              </Center>
            ) : notifications && notifications.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {notifications.map((notification) => (
                  <Box
                    key={notification._id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={notification.read ? "transparent" : colorMode === "light" ? "blue.50" : "blue.900"}
                    cursor="pointer"
                    onClick={() => handleNotificationClick(notification)}
                    _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
                    position="relative"
                  >
                    <Flex justifyContent="space-between" alignItems="center">
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={notification.sender?.nome || "Usuário"}
                          src={notification.sender?.avatar}
                        />
                        <Box>
                          <Text fontWeight="medium">{notification.content}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </Box>
                      </HStack>
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Excluir notificação"
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                      />
                    </Flex>
                  </Box>
                ))}
                <Button
                  mt={4}
                  colorScheme="blue"
                  variant="outline"
                  onClick={handleViewAllNotifications}
                >
                  Ver todas as notificações
                </Button>
              </VStack>
            ) : (
              <Center py={10}>
                <Text color="gray.500">Nenhuma notificação encontrada</Text>
              </Center>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
