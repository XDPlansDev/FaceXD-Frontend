// Caminho: /pages/profile/index.js
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

export default function MyProfileRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(`/profile/${user.id}`);
    }
  }, [user]);

  return null; // Nada a renderizar
}
