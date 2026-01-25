import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// --- IMPORTS CORRIGIDOS ---
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { CadastroUsuario } from './views/CadastroUsuario';

// 1. O IMPORT DO DASHBOARD AGORA ESTÁ CERTO:
import { Dashboard } from './views/Dashboard'; 

// 2. SEUS ARQUIVOS ANTIGOS (Baseado no que você me mandou antes, esses usam export default)
import TurmasView from './views/TurmasView';
import FormBuilderView from './views/FormBuilderView';

// 3. ESSES AQUI SÃO "CHUTES" (Se der erro neles, tente adicionar ou tirar as chaves { })
// Vou assumir que são 'export default' igual ao TurmasView
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

          {/* ROTA PRINCIPAL: DASHBOARD */}
          <Route path="/" element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          } />

          <Route path="/turmas" element={<RotaProtegida><TurmasView /></RotaProtegida>} />
          <Route path="/cadastro-usuario" element={<RotaProtegida><CadastroUsuario /></RotaProtegida>} />
          <Route path="/criar-formulario" element={<RotaProtegida><FormBuilderView /></RotaProtegida>} />
          <Route path="/alunos" element={<RotaProtegida><AlunosView /></RotaProtegida>} />
          <Route path="/comparacao" element={<RotaProtegida><ComparacaoView /></RotaProtegida>} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;