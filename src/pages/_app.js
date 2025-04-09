// 📄 Caminho: /pages/_app.js

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import OneSignalInitializer from "@/components/OneSignalInitializer"; // ✅ Importando o OneSignal
import "../styles/globals.css";
import { CssBaseline } from "@mui/material";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CssBaseline /> {/* 📌 Reset global de estilos (MUI) */}
      <OneSignalInitializer /> {/* ✅ Inicializa OneSignal para notificações push */}
      <Navbar /> {/* 📌 Barra de navegação visível em todas as páginas */}
      <div className="mt-16"> {/* 🧱 Garante espaçamento abaixo da Navbar */}
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}
