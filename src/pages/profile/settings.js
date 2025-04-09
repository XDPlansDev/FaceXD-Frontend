import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
} from "@mui/material";

export default function ProfileSettings() {
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
  const [alert, setAlert] = useState({ message: "", severity: "success", open: false });
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return setAlert({ message: "Usuário não autenticado", severity: "error", open: true });
        }

        const response = await fetch(`${BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);

          if (data.usernameChangedAt) {
            const lastChange = new Date(data.usernameChangedAt);
            const now = new Date();
            const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
            setUsernameEditable(diffDays >= 30);
          }
        } else {
          setAlert({ message: "Erro ao buscar dados do perfil", severity: "error", open: true });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do perfil", err);
        setAlert({ message: "Erro ao carregar dados do perfil", severity: "error", open: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [BASE_URL]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const confirm = window.confirm("Tem certeza que deseja salvar as alterações?");
    if (!confirm) return;

    if (!userData.nome || !userData.sobrenome) {
      return setAlert({ message: "Preencha nome e sobrenome", severity: "warning", open: true });
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return setAlert({ message: "Usuário não autenticado", severity: "error", open: true });
      }

      const body = {
        nome: userData.nome,
        sobrenome: userData.sobrenome,
        bio: userData.bio,
        sexo: userData.sexo,
        dataNascimento: userData.dataNascimento,
      };

      if (usernameEditable) {
        body.username = userData.username;
      }

      const response = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserData(updatedData);

        if (updatedData.usernameChangedAt) {
          const lastChange = new Date(updatedData.usernameChangedAt);
          const now = new Date();
          const diffDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));
          setUsernameEditable(diffDays >= 30);
        }

        setAlert({
          message: "Perfil atualizado com sucesso!",
          severity: "success",
          open: true,
        });
      } else {
        setAlert({
          message: "Erro ao atualizar perfil.",
          severity: "error",
          open: true,
        });
      }
    } catch (err) {
      console.error("Erro ao salvar dados", err);
      setAlert({
        message: "Erro ao salvar os dados. Tente novamente.",
        severity: "error",
        open: true,
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Configurações do Perfil
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Nome"
            name="nome"
            fullWidth
            value={userData.nome}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Sobrenome"
            name="sobrenome"
            fullWidth
            value={userData.sobrenome}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            disabled={!usernameEditable}
            value={userData.username}
            onChange={handleChange}
            helperText={
              usernameEditable
                ? "Você pode alterar seu username"
                : "Você só pode alterar o username a cada 30 dias"
            }
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Bio"
            name="bio"
            fullWidth
            multiline
            rows={3}
            value={userData.bio}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={6}>
          <TextField
            select
            label="Sexo"
            name="sexo"
            fullWidth
            value={userData.sexo}
            onChange={handleChange}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Feminino">Feminino</MenuItem>
            <MenuItem value="Outro">Outro</MenuItem>
            <MenuItem value="">Prefiro não dizer</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={6}>
          <TextField
            label="Data de Nascimento"
            name="dataNascimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={userData.dataNascimento}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          {!usernameEditable && (
            <Alert severity="info">
              Alterações no username só são permitidas a cada 30 dias.
            </Alert>
          )}
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSave}
          >
            Salvar
          </Button>
        </Grid>
      </Grid>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alert.severity} onClose={handleCloseAlert} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
