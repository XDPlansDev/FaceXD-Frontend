import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    Badge,
    Button,
    Flex,
    Spinner,
    Center,
    Divider,
    useToast,
    IconButton,
    Tooltip,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorMode
} from "@chakra-ui/react";
import { FaCheck, FaTrash, FaBell, FaUserFriends, FaHeart, FaComment } from "react-icons/fa";
import Head from "next/head";

export default function NotificationsPage() {
    const { user } = useAuth();
    const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
    const [filter, setFilter] = useState("all");
    const router = useRouter();
    const toast = useToast();
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        fetchNotifications();
    }, [user, router, fetchNotifications]);

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

    const handleDeleteNotification = async (notificationId) => {
        await deleteNotification(notificationId);
        toast({
            title: "Notificação excluída",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "friend_request":
            case "friend_accepted":
                return <FaUserFriends color="#3182CE" />;
            case "post_like":
                return <FaHeart color="#E53E3E" />;
            case "post_comment":
                return <FaComment color="#38A169" />;
            case "follow":
                return <FaUserFriends color="#805AD5" />;
            default:
                return <FaBell color="#718096" />;
        }
    };

    const getNotificationBadgeColor = (type) => {
        switch (type) {
            case "friend_request":
            case "friend_accepted":
                return "blue";
            case "post_like":
                return "red";
            case "post_comment":
                return "green";
            case "follow":
                return "purple";
            default:
                return "gray";
        }
    };

    const getNotificationTypeText = (type) => {
        switch (type) {
            case "friend_request":
                return "Solicitação de amizade";
            case "friend_accepted":
                return "Amizade aceita";
            case "post_like":
                return "Curtiu seu post";
            case "post_comment":
                return "Comentou no seu post";
            case "follow":
                return "Começou a seguir você";
            default:
                return "Notificação";
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        return notification.type === filter;
    });

    if (!user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Notificações | Face XD</title>
                <meta name="description" content="Veja suas notificações no Face XD" />
            </Head>

            <Container maxW="800px" py={8}>
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <Heading as="h1" size="lg">
                        Notificações
                    </Heading>
                    {notifications.length > 0 && (
                        <Button
                            leftIcon={<FaCheck />}
                            colorScheme="blue"
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                        >
                            Marcar todas como lidas
                        </Button>
                    )}
                </Flex>

                <Tabs variant="enclosed" onChange={(index) => {
                    const filters = ["all", "unread", "friend_request", "post_like", "post_comment", "follow"];
                    setFilter(filters[index]);
                }}>
                    <TabList mb="1em">
                        <Tab>Todas</Tab>
                        <Tab>Não lidas</Tab>
                        <Tab>Amizades</Tab>
                        <Tab>Curtidas</Tab>
                        <Tab>Comentários</Tab>
                        <Tab>Seguidores</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                        <TabPanel>
                            <NotificationList
                                notifications={filteredNotifications}
                                loading={loading}
                                handleNotificationClick={handleNotificationClick}
                                handleDeleteNotification={handleDeleteNotification}
                                getNotificationIcon={getNotificationIcon}
                                getNotificationBadgeColor={getNotificationBadgeColor}
                                getNotificationTypeText={getNotificationTypeText}
                                colorMode={colorMode}
                            />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Container>
        </>
    );
}

function NotificationList({
    notifications,
    loading,
    handleNotificationClick,
    handleDeleteNotification,
    getNotificationIcon,
    getNotificationBadgeColor,
    getNotificationTypeText,
    colorMode
}) {
    if (loading) {
        return (
            <Center py={10}>
                <Spinner size="xl" />
            </Center>
        );
    }

    if (notifications.length === 0) {
        return (
            <Center py={10}>
                <Text color="gray.500">Nenhuma notificação encontrada</Text>
            </Center>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            {notifications.map((notification) => (
                <Box
                    key={notification._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg={notification.read ? "transparent" : colorMode === "light" ? "blue.50" : "blue.900"}
                    cursor="pointer"
                    onClick={() => handleNotificationClick(notification)}
                    _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
                    position="relative"
                    transition="all 0.2s"
                >
                    <Flex justifyContent="space-between" alignItems="center">
                        <HStack spacing={4} flex="1">
                            <Avatar
                                size="md"
                                name={notification.sender.nome}
                                src={notification.sender.avatar}
                            />
                            <Box flex="1">
                                <HStack spacing={2} mb={1}>
                                    <Text fontWeight="bold">{notification.sender.nome}</Text>
                                    <Badge colorScheme={getNotificationBadgeColor(notification.type)}>
                                        {getNotificationTypeText(notification.type)}
                                    </Badge>
                                </HStack>
                                <Text>{notification.content}</Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
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
                        <HStack spacing={2}>
                            <Tooltip label="Excluir notificação">
                                <IconButton
                                    icon={<FaTrash />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    aria-label="Excluir notificação"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNotification(notification._id);
                                    }}
                                />
                            </Tooltip>
                        </HStack>
                    </Flex>
                </Box>
            ))}
        </VStack>
    );
} 