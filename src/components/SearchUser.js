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
import Link from "next/link";

const { Search } = Input;
const { Text } = Typography;

export default function SearchUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = async (value) => {
        const term = value.trim();
        if (term.length < 3) {
            setResults([]);
            return;
        }

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

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearch(value);
    };

    const renderSearchInput = (
        <Search
            placeholder="Pesquisar usuários..."
            allowClear
            size="large"
            value={searchTerm}
            onChange={handleInputChange}
            style={{ width: "100%" }}
        />
    );

    const renderResults = () => {
        if (loading) return <Spin tip="Carregando usuários..." />;
        if (!results.length && searchTerm.length >= 3) return <Empty description="Nenhum usuário encontrado." />;
        if (searchTerm.length < 3) return <Empty description="Digite pelo menos 3 letras para buscar." />;

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
            <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={() => setIsModalOpen(true)}
            />
            <Modal
                title="Pesquisar usuários"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSearchTerm("");
                    setResults([]);
                }}
                footer={null}
                width="100%"
                style={{ top: 0 }}
                bodyStyle={{ height: "calc(100vh - 110px)", overflow: "auto" }}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {renderSearchInput}
                    {renderResults()}
                </Space>
            </Modal>
        </>
    );
}
