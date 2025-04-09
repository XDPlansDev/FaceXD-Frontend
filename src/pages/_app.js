// 📄 Caminho: /pages/_app.js

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import Navbar from "@/components/Navbar";
import OneSignalInitializer from "@/components/OneSignalInitializer"; // ✅ Inicializa o OneSignal
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      {/* 🎨 Aplica o tema baseado no contexto (light/dark) */}
      <Theme
        appearance="inherit"
        accentColor="violet"
        grayColor="mauve"
        radius="large"
      >
        <AuthProvider>
          <OneSignalInitializer /> {/* ✅ Notificações push */}
          <Navbar /> {/* 📌 Barra de navegação global */}
          <div className="mt-16"> {/* 🧱 Espaço abaixo da Navbar */}
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </Theme>
    </ThemeProvider>
  );
}
