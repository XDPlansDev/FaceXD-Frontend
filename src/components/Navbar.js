// 📄 Caminho: /components/Navbar.js

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo + Feed */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{ color: "white", textDecoration: "none" }}
          >
            Face XD
          </Typography>

          {/* Botão Feed (somente se logado) */}
          {user && (
            <Button component={Link} href="/feed" sx={{ color: "white" }}>
              Feed
            </Button>
          )}
        </Box>

        {/* Se estiver logado: avatar + menu */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar onClick={handleMenuOpen} sx={{ cursor: "pointer" }} />
            <Typography variant="subtitle1" sx={{ color: "white" }}>
              {user.name}
            </Typography>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem
                component={Link}
                href={`/profile/${user.username}`}
                onClick={handleMenuClose}
              >
                Ver Perfil
              </MenuItem>
              <MenuItem
                component={Link}
                href="/profile/settings"
                onClick={handleMenuClose}
              >
                Configurações
              </MenuItem>
              <MenuItem
                onClick={() => {
                  logout();
                  handleMenuClose();
                }}
              >
                Sair
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          // Se NÃO estiver logado: Entrar e Registrar
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button component={Link} href="/auth/login" color="inherit">
              Entrar
            </Button>
            <Button component={Link} href="/auth/register" color="inherit">
              Registrar
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
