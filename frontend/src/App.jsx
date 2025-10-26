import React, { useEffect, useState } from "react";
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
    return null; // Evita "piscar" a tela
  }
  
  if (!auth.user) {
    return <LoginView login={auth.login} register={auth.register} />;
  }
  
  return <Dashboard user={auth.user} logout={auth.logout} />;
}