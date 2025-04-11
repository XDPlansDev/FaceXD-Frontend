import { AuthProvider } from "@/context/AuthContext";
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import OneSignalInitializer from "@/components/OneSignalInitializer";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
    return (
        <ChakraProvider>
            <AuthProvider>
                <OneSignalInitializer />
                <Navbar />
                <div className="mt-16">
                    <Component {...pageProps} />
                </div>
            </AuthProvider>
        </ChakraProvider>
    );
} 