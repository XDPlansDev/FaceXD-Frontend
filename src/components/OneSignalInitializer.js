import { useEffect } from "react";

export default function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // ✅ Evita múltiplas inicializações
      if (window.OneSignalInitialized) {
        console.log("⚠️ OneSignal já foi inicializado.");
        return;
      }

      // ✅ Marca como inicializado
      window.OneSignalInitialized = true;

      // 📦 Adiciona o script da SDK
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      document.head.appendChild(script);

      // 🚀 Inicializa o OneSignal após carregar
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(function (OneSignal) {
        OneSignal.init({
          appId: "e5258637-d4a3-4be5-8c1e-fe099d7ab13d",
          notifyButton: {
            enable: true,
          },
        });

        // ✅ Log de confirmação
        console.log("✅ OneSignal foi inicializado com sucesso!");
      });
    }
  }, []);

  return null;
}
