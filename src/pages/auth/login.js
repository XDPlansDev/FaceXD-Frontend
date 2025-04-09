// 📄 Caminho: /pages/auth/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Spin,
  Card,
  Space
} from "antd";

const { Title, Text } = Typography;

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        console.log(`✅ Login com @${data.user.username}`);
        router.push("/feed");
      } else {
        setError("Usuário ou senha inválidos.");
        console.warn("⚠️ Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
      console.error("❌ Erro ao conectar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
      <Card>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={3} style={{ textAlign: "center" }}>
            Entrar
          </Title>
          <Text type="secondary" style={{ textAlign: "center", display: "block" }}>
            Faça login com e-mail e senha.
          </Text>

          {error && <Alert type="error" message={error} showIcon />}

          <Form layout="vertical" onFinish={handleLogin}>
            <Form.Item label="E-mail ou Username" required>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </Form.Item>
            <Form.Item label="Senha" required>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                disabled={!identifier || !password}
              >
                Entrar
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ textAlign: "center" }}>
            Não tem uma conta?{' '}
            <Link href="/auth/register" passHref>
              <Button type="link" size="small">
                Registrar
              </Button>
            </Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
}
