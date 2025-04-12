import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Text,
  Input,
  Button,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  useToast,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Spinner,
  Center,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function ProfileSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [userData, setUserData] = useState({
    nome: "",
    sobrenome: "",
    username: "",
    bio: "",
    sexo: "",
    dataNascimento: "",
    usernameChangedAt: null,
  });

  const [usernameEditable, setUsernameEditable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Dados recebidos:", data); // Debug temporário

          // Formata a data para o formato aceito pelo input date
          const formattedDate = data.dataNascimento ?
            new Date(data.dataNascimento).toISOString().split('T')[0] :
            '';

          setUserData({
            ...data,
            dataNascimento: formattedDate,
            bio: data.bio || '',
            // Garante que o sexo seja mantido mesmo se for uma string vazia
            sexo: data.sexo !== undefined ? data.sexo : '',
          });
          setOriginalUsername(data.username);

          if (data.usernameChangedAt) {
            const lastChange = new Date(data.usernameChangedAt);
            const now = new Date();
            const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
            setUsernameEditable(diffDays >= 30);
          }
        } else {
          toast({
            title: "Erro",
            description: "Erro ao buscar dados do perfil",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do perfil", err);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do perfil",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL, router, toast]);

  const sanitizeText = (text) => {
    if (!text) return '';
    // Permite espaços e caracteres básicos, remove apenas caracteres problemáticos
    return text
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Remove apenas caracteres de controle problemáticos
      .replace(/[\u007F-\u009F]/g, '') // Remove caracteres Unicode problemáticos
      .replace(/[<>]/g, '') // Remove tags HTML
      .replace(/\\"/g, '"') // Corrige aspas escapadas
      .trim();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      setUsernameError("");
      if (value && !/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
        setUsernameError("Username deve conter apenas letras, números e _ (3-20 caracteres)");
      }
    }

    // Para a bio, apenas remove caracteres realmente problemáticos
    if (name === "bio") {
      const sanitizedValue = value.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');
      setUserData(prev => ({ ...prev, [name]: sanitizedValue }));
      return;
    }

    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/check-username/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Erro ao verificar disponibilidade do username:", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!userData.nome || !userData.sobrenome) {
      toast({
        title: "Erro",
        description: "Preencha nome e sobrenome",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (userData.username !== originalUsername) {
      if (usernameError) {
        toast({
          title: "Erro",
          description: usernameError,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const isAvailable = await checkUsernameAvailability(userData.username);
      if (!isAvailable) {
        setUsernameError("Username já está em uso");
        toast({
          title: "Erro",
          description: "Username já está em uso",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setModalType("username");
      setIsModalOpen(true);
      return;
    }

    setModalType("save");
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Dados básicos sem nenhuma manipulação
      const dataToSend = {};

      // Só adiciona campos que realmente têm valor
      if (userData.nome) dataToSend.nome = userData.nome;
      if (userData.sobrenome) dataToSend.sobrenome = userData.sobrenome;
      if (userData.bio !== undefined) dataToSend.bio = userData.bio;
      if (userData.sexo) dataToSend.sexo = userData.sexo;
      if (userData.dataNascimento) dataToSend.dataNascimento = userData.dataNascimento;

      // Adiciona username apenas se estiver mudando
      if (userData.username !== originalUsername && usernameEditable) {
        dataToSend.username = userData.username;
      }

      console.log('Tentando atualizar perfil com dados:', dataToSend);

      // Usa o endpoint correto com método PUT
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      // Se der erro, mostra detalhes
      if (!response.ok) {
        let errorMessage;
        try {
          const errorText = await response.text();
          console.error("Erro do servidor:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            endpoint: `${API_URL}/api/users/me`,
            method: "PUT"
          });
          errorMessage = `Erro ao atualizar perfil (${response.status}): ${errorText}`;
        } catch (e) {
          errorMessage = `Erro ao atualizar perfil. Status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Processa a resposta
      let responseData;
      try {
        responseData = await response.json();
        console.log('Perfil atualizado com sucesso:', responseData);
      } catch (e) {
        console.error('Erro ao processar resposta:', e);
        throw new Error('Erro ao processar resposta do servidor');
      }

      // Atualiza os dados do usuário
      const formattedDate = responseData.dataNascimento ?
        new Date(responseData.dataNascimento).toISOString().split('T')[0] :
        '';

      setUserData({
        ...responseData,
        dataNascimento: formattedDate,
        bio: responseData.bio ?? '',
        sexo: responseData.sexo ?? ''
      });

      setOriginalUsername(responseData.username);

      if (responseData.usernameChangedAt) {
        const lastChange = new Date(responseData.usernameChangedAt);
        const now = new Date();
        const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
        setUsernameEditable(diffDays >= 30);
      }

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      toast({
        title: "Erro",
        description: err.message || "Erro ao salvar os dados. Tente novamente.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Configurações do Perfil</Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <FormControl isRequired isInvalid={!userData.nome}>
              <FormLabel>Nome</FormLabel>
              <Input
                name="nome"
                value={userData.nome}
                onChange={handleChange}
              />
              {!userData.nome && (
                <FormErrorMessage>Nome é obrigatório</FormErrorMessage>
              )}
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isRequired isInvalid={!userData.sobrenome}>
              <FormLabel>Sobrenome</FormLabel>
              <Input
                name="sobrenome"
                value={userData.sobrenome}
                onChange={handleChange}
              />
              {!userData.sobrenome && (
                <FormErrorMessage>Sobrenome é obrigatório</FormErrorMessage>
              )}
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl isInvalid={!!usernameError}>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={userData.username}
                onChange={handleChange}
                isDisabled={!usernameEditable}
              />
              <FormErrorMessage>{usernameError}</FormErrorMessage>
              {!usernameError && (
                <Text fontSize="sm" color="gray.500">
                  {usernameEditable
                    ? "Você pode alterar seu username (apenas letras, números e _)"
                    : `Você poderá alterar o username novamente em ${30 - Math.floor((new Date() - new Date(userData.usernameChangedAt)) / (1000 * 60 * 60 * 24))
                    } dias`}
                </Text>
              )}
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea
                name="bio"
                value={userData.bio || ''}
                onChange={handleChange}
                resize="vertical"
                minH="100px"
                maxLength={500}
                placeholder="Escreva algo sobre você..."
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {`${(userData.bio || '').length}/500 caracteres`}
              </Text>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Sexo</FormLabel>
              <Select
                name="sexo"
                value={userData.sexo}
                onChange={handleChange}
                defaultValue=""
              >
                <option value="">Prefiro não dizer</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </Select>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {userData.sexo ? `Selecionado: ${userData.sexo}` : 'Nenhuma opção selecionada'}
              </Text>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Data de Nascimento</FormLabel>
              <Input
                name="dataNascimento"
                type="date"
                value={userData.dataNascimento || ''}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <Button
              colorScheme="blue"
              width="100%"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Salvando..."
              isDisabled={!userData.nome || !userData.sobrenome}
            >
              Salvar Alterações
            </Button>
          </GridItem>
        </Grid>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {modalType === "username" ? "Alterar Username" : "Confirmar Alterações"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {modalType === "username"
                ? `Tem certeza que deseja alterar seu username para "${userData.username}"? Você só poderá alterá-lo novamente após 30 dias.`
                : "Tem certeza que deseja salvar as alterações no seu perfil?"}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={handleConfirmSave} isLoading={saving}>
                Confirmar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
}
