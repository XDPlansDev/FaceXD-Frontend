// 📄 /components/Navbar.js (com Ant Design)

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Layout, Menu, Button, Dropdown, Avatar, Space, Typography } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined, HomeOutlined, MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  const menuItems = [
    {
      key: "profile",
      label: <Link href={`/profile/${user?.username}`}>Meu Perfil</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: <Link href="/profile/settings">Configurações</Link>,
      icon: <SettingOutlined />,
    },
    {
      key: "logout",
      label: "Sair",
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Header style={{ background: "#fff", padding: "0 24px", boxShadow: "0 2px 8px #f0f1f2" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
        {/* Logo e link para o feed */}
        <Space size="large" align="center">
          <Link href="/">
            <Typography.Title level={4} style={{ margin: 0, color: "#1677ff" }}>
              Face XD
            </Typography.Title>
          </Link>
          {user && (
            <Link href="/feed">
              <Button type="text" icon={<HomeOutlined />}>Feed</Button>
            </Link>
          )}
        </Space>

        {/* Login / Perfil */}
        {user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar>{user.username?.[0]?.toUpperCase() || "U"}</Avatar>
              <span style={{ fontWeight: 500 }}>{user.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Link href="/auth/login">
              <Button type="default">Entrar</Button>
            </Link>
            <Link href="/auth/register">
              <Button type="primary">Registrar</Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
}
