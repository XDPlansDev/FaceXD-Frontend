import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ChakraProvider, Box } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import OneSignalInitializer from "@/components/OneSignalInitializer";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
    return (
        <ChakraProvider>
            <AuthProvider>
                <NotificationProvider>
                    <OneSignalInitializer />
                    <Box minH="100vh">
                        <Navbar />
                        <Box as="main" pt="70px">
                            <Component {...pageProps} />
                        </Box>
                    </Box>
                </NotificationProvider>
            </AuthProvider>
        </ChakraProvider>
    );
} 