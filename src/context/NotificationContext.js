// context/NotificationContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@chakra-ui/react";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const toast = useToast();

    // Função para buscar notificações
    const fetchNotifications = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao buscar notificações");

            const data = await response.json();
            console.log("🔔 Notificações recebidas:", data);
            setNotifications(data);

            // Contar notificações não lidas
            const unreadCount = data.filter(notification => !notification.read).length;
            setUnreadCount(unreadCount);
        } catch (error) {
            console.error("❌ Erro ao buscar notificações:", error);
            toast({
                title: "Erro ao buscar notificações",
                description: "Não foi possível carregar suas notificações",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar contagem de notificações não lidas
    const fetchUnreadCount = async () => {
        if (!user) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao buscar contagem de notificações");

            const data = await response.json();
            console.log("🔔 Contagem de notificações não lidas:", data.count);
            setUnreadCount(data.count);
        } catch (error) {
            console.error("❌ Erro ao buscar contagem de notificações:", error);
        }
    };

    // Função para marcar uma notificação como lida
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao marcar notificação como lida");

            // Atualizar o estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification._id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            // Atualizar contagem de não lidas
            setUnreadCount(prev => Math.max(0, prev - 1));

            return true;
        } catch (error) {
            console.error("❌ Erro ao marcar notificação como lida:", error);
            toast({
                title: "Erro ao marcar notificação como lida",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }
    };

    // Função para marcar todas as notificações como lidas
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao marcar todas as notificações como lidas");

            // Atualizar o estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({ ...notification, read: true }))
            );

            // Resetar contagem de não lidas
            setUnreadCount(0);

            toast({
                title: "Todas as notificações foram marcadas como lidas",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            return true;
        } catch (error) {
            console.error("❌ Erro ao marcar todas as notificações como lidas:", error);
            toast({
                title: "Erro ao marcar todas as notificações como lidas",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }
    };

    // Função para excluir uma notificação
    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Erro ao excluir notificação");

            // Atualizar o estado local
            setNotifications(prevNotifications =>
                prevNotifications.filter(notification => notification._id !== notificationId)
            );

            // Atualizar contagem de não lidas se a notificação não estava lida
            const deletedNotification = notifications.find(n => n._id === notificationId);
            if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            toast({
                title: "Notificação excluída com sucesso",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            return true;
        } catch (error) {
            console.error("❌ Erro ao excluir notificação:", error);
            toast({
                title: "Erro ao excluir notificação",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return false;
        }
    };

    // Buscar notificações quando o usuário estiver autenticado
    useEffect(() => {
        if (user) {
            console.log("🔄 Buscando notificações para o usuário:", user.username);
            fetchNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
        }
    }, [user]);

    // Atualizar contagem de notificações não lidas a cada 30 segundos
    useEffect(() => {
        if (user) {
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications deve ser usado dentro de um NotificationProvider");
    }
    return context;
} 