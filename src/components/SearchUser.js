import { useState } from "react";
import {
    Input,
    Modal,
    Button,
    Space,
    List,
    Avatar,
    Spin,
    Typography,
    Empty,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";

const { Search } = Input;
const { Text } = Typography;

export default function SearchUser() {
    // 🎯 Estados para controle do termo, resultados, loading e modal (mobile)
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 📱 Verificação de tela mobile
    const isMobile = useMediaQuery({ maxWidth: 768 });

    /**
     * 🔍 Função para buscar usuários no backend
     * Consulta a API com o termo de busca
     */
    const handleSearch = async (value) => {
        const term = value.trim();
        if (!term) return;

        console.log("🔍 Buscando usuários por:", term);
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/api/users/search?query=${encodeURIComponent(term)}`);
            const data = await res.json();

            console.log("✅ Resultados recebidos:", data);
            setResults(data);
        } catch (error) {
            console.error("❌ Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * 🎯 Campo de pesquisa reutilizável
     */
    const renderSearchInput = (
        <Search
            placeholder="Pesquisar usuários..."
            allowClear
            enterButton="Buscar"
            size="middle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: 350 }}
        />
    );

    /**
     * 📋 Exibe os resultados da busca
     */
    const renderResults = () => {
        if (loading) return <Spin tip="Carregando usuários..." />;
        if (!results.length) return <Empty description="Nenhum usuário encontrado." />;

        return (
            <List
                itemLayout="horizontal"
                dataSource={results}
                renderItem={(user) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={
                                <Link href={`/profile/${user.username}`}>
                                    <Text strong>{user.name} @{user.username}</Text>
                                </Link>
                            }
                            description={`Email: ${user.email}`}
                        />
                    </List.Item>
                )}
            />
        );
    };

    return (
        <>
            {/* 🔍 Versão Mobile com Modal */}
            {isMobile ? (
                <>
                    <Button
                        type="text"
                        icon={<SearchOutlined />}
                        onClick={() => setIsModalOpen(true)}
                    />
                    <Modal
                        title="Pesquisar usuários"
                        open={isModalOpen}
                        onCancel={() => setIsModalOpen(false)}
                        footer={null}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            {renderSearchInput}
                            {renderResults()}
                        </Space>
                    </Modal>
                </>
            ) : (
                // 💻 Versão Desktop
                <Space size="large" align="center">
                    {renderSearchInput}
                    {renderResults()}
                </Space>
            )}
        </>
    );
}
