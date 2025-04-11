import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { ColorModeScript } from "@chakra-ui/react";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* OneSignal SDK via CDN */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="beforeInteractive"
        />
        <Script
          id="onesignal-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(function(OneSignal) {
                OneSignal.init({
                  appId: "e5258637-d4a3-4be5-8c1e-fe099d7ab13d",
                });
              });
            `,
          }}
        />
      </Head>
      <body>
        <ColorModeScript initialColorMode="light" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
