import React, { useEffect, useState } from "react";
// Importe o hook e as duas telas principais
import { useAuth } from "./hooks/useAuth";
import LoginView from "./views/LoginView";
import Dashboard from "./views/Dashboard";

export default function App() {
  const auth = useAuth();
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return null; // Evita "piscar" a tela de login
  }

  // Se não há usuário, mostra a tela de Login
  if (!auth.user) {
    // Passa as funções de login/register para a tela de Login
    return <LoginView login={auth.login} register={auth.register} />;
  }

  // Se há usuário, mostra o Dashboard
  return <Dashboard user={auth.user} logout={auth.logout} />;
}