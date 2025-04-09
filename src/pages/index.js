// 📄 /pages/index.js (com Ant Design)

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, Typography, Layout, Row, Col, Space } from "antd";
import { useAuth } from "@/context/AuthContext";
import { SmileOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Content, Header } = Layout;

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
    <Layout style={{ minHeight: "100vh" }}>
      {/* Cabeçalho */}
      <Header style={{ backgroundColor: "#fff", boxShadow: "0 2px 8px #f0f1f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src="/logo.png" alt="Face XD Logo" width={60} height={60} priority />
      </Header>

      {/* Conteúdo principal */}
      <Content style={{ padding: "50px 20px", backgroundColor: "#f9fafb" }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={14} style={{ textAlign: "center" }}>
            <Typography.Title level={1} style={{ fontWeight: 700, marginBottom: 16 }}>
              Face XD: A Rede Social Exclusiva para São Paulo
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ fontSize: 18 }}>
              Face XD é uma iniciativa inovadora criada por <strong>David Xavier</strong> para promover a educação e o auto desenvolvimento.<br />
              Conecte-se com pessoas da sua cidade e cresça pessoal e profissionalmente.
            </Typography.Paragraph>

            <Space size="large" style={{ marginTop: 40 }}>
              {isLoggedIn && user ? (
                <>
                  <Link href="/feed" passHref>
                    <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                      Ir para o Feed
                    </Button>
                  </Link>
                  <Link href={`/profile/${user.username}`} passHref>
                    <Button size="large">Meu Perfil</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" passHref>
                    <Button type="primary" size="large">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Button size="large" type="default" icon={<SmileOutlined />}>
                      Registrar
                    </Button>
                  </Link>
                </>
              )}
            </Space>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
