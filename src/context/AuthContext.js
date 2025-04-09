// 📄 Caminho: context/AuthContext.js

import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import app from "@/utils/firebase"; // Firebase inicializado

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Carrega dados adicionais do Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userData,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const login = (sessionData) => {
    // Recebe os dados do Firebase + Firestore após login
    setUser(sessionData);
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((err) => {
        console.error("Erro ao sair:", err.message);
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {loading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>Carregando...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
