// Caminho: /pages/_app.js

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar"; // 📌 Importando o Navbar
import "../styles/globals.css";
import { CssBaseline } from "@mui/material"; // 📌 Estilização global do MUI

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CssBaseline /> {/* 📌 Reseta os estilos padrões para manter a consistência com MUI */}
      <Navbar /> {/* 📌 Navbar presente em todas as páginas */}
      <div className="mt-16"> {/* 🚀 Adicionando margem para evitar sobreposição do conteúdo com a Navbar fixa */}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
