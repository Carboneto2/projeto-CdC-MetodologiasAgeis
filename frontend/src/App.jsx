import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import Dashboard from "./views/Dashboard";
import TurmasView from './views/TurmasView';
import AlunosView from './views/AlunosView';
import FormBuilderView from './views/FormBuilderView'; 
import ComparacaoView from './views/ComparacaoView';   
import GestaoUsuariosView from './views/GestaoUsuariosView'; 
import AreaRestritaView from './views/AreaRestritaView'; 

// --- FUNÇÃO AUXILIAR PARA VERIFICAR SE É ADMIN ---
const isUserAdmin = (user) => {
    if (!user) return false;
    return user.perfil === 'Coordenador' || user.perfil === 'coordenador' || user.login === 'admin';
};

const HomeRedirect = () => {
  const { user, authenticated, loading } = useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/login" />;

  // Se for Admin, vai pro Dashboard. Se não, Área Restrita.
  if (isUserAdmin(user)) return <Navigate to="/dashboard" />;
  return <Navigate to="/area-restrita" />;
};

const RotaProtegida = ({ children }) => {
    const { authenticated, loading } = useContext(AuthContext);
    if (loading) return <div>...</div>;
    if (!authenticated) return <Navigate to="/login" />;
    return <><Navbar /><div className="p-5">{children}</div></>;
};

const RotaAdmin = ({ children }) => {
  const { user, authenticated, loading } = useContext(AuthContext);
  if (loading) return <div>...</div>;
  if (!authenticated) return <Navigate to="/login" />;
  
  // VERIFICAÇÃO FLEXÍVEL
  if (!isUserAdmin(user)) {
      return <Navigate to="/area-restrita" />;
  }
  return <><Navbar /><div className="p-5">{children}</div></>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* ROTAS ADMIN */}
          <Route path="/dashboard" element={<RotaAdmin><Dashboard /></RotaAdmin>} />
          <Route path="/usuarios" element={<RotaAdmin><GestaoUsuariosView /></RotaAdmin>} />
          <Route path="/turmas" element={<RotaAdmin><TurmasView /></RotaAdmin>} />
          <Route path="/alunos" element={<RotaAdmin><AlunosView /></RotaAdmin>} />
          <Route path="/criar-formulario" element={<RotaAdmin><FormBuilderView /></RotaAdmin>} />
          <Route path="/comparacao" element={<RotaAdmin><ComparacaoView /></RotaAdmin>} />

          {/* ROTA COMUM */}
          <Route path="/area-restrita" element={<RotaProtegida><AreaRestritaView /></RotaProtegida>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;