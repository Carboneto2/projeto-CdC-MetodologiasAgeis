import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// --- IMPORTS ---
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { CadastroUsuario } from './views/CadastroUsuario';
import TurmasView from './views/TurmasView';

// --- TRAGA DE VOLTA SEUS ARQUIVOS ANTIGOS AQUI ---
// (Verifique se os nomes dos arquivos estão certinhos na sua pasta views)
import AlunosView from './views/AlunosView'; 
import ComparacaoView from './views/ComparacaoView'; 

const RotaProtegida = ({ children }) => {
  const { authenticated, loading } = useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!authenticated) return <Navigate to="/login" />;
  return (
    <>
      <Navbar /> 
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          {/* Rota Home (Turmas) */}
          <Route path="/" element={<RotaProtegida><TurmasView /></RotaProtegida>} />

          {/* Rota Alunos (Recuperada) */}
          <Route path="/alunos" element={<RotaProtegida><AlunosView /></RotaProtegida>} />

          {/* Rota Comparação (Recuperada) */}
          <Route path="/comparacao" element={<RotaProtegida><ComparacaoView /></RotaProtegida>} />

          {/* Rota Admin */}
          <Route path="/cadastro-usuario" element={<RotaProtegida><CadastroUsuario /></RotaProtegida>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;