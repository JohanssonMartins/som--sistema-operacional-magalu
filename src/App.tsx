import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from './store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { api } from './api';
import { useRealtime } from './hooks/useRealtime';

// Pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Rank = lazy(() => import('./pages/Rank').then(m => ({ default: m.Rank })));
const Autoauditoria = lazy(() => import('./pages/Autoauditoria').then(m => ({ default: m.Autoauditoria })));
const AvaliacaoExterna = lazy(() => import('./pages/AvaliacaoExterna').then(m => ({ default: m.AvaliacaoExterna })));
const UserManagement = lazy(() => import('./pages/UserManagement').then(m => ({ default: m.UserManagement })));
const BaseChecklist = lazy(() => import('./pages/BaseChecklist').then(m => ({ default: m.BaseChecklist })));

// Components
import { Shell } from './components/Shell';
import { MainLogo } from './components/Logos';

const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
    <MainLogo size="large" />
    <div className="mt-8 flex items-center gap-2">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
        className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
        className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"
      />
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
        className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"
      />
    </div>
  </div>
);

export const App = () => {
  const {
    currentUser,
    setUsersList,
    setBaseItems,
    autoauditoriaMesAno,
    setAllAutoauditorias,
    selectedUnit,
    setSelectedUnit
  } = useStore(useShallow(state => ({
    currentUser: state.currentUser,
    setUsersList: state.setUsersList,
    setBaseItems: state.setBaseItems,
    autoauditoriaMesAno: state.autoauditoriaMesAno,
    setAllAutoauditorias: state.setAllAutoauditorias,
    selectedUnit: state.selectedUnit,
    setSelectedUnit: state.setSelectedUnit
  })));

  const { socket } = useRealtime();

  // Enforce unit restriction for non-privileged users
  useEffect(() => {
    if (currentUser) {
      const isPrivileged = ['ADMIN', 'GERENTE_DIVISIONAL', 'DIRETORIA', 'AUDITOR'].includes(currentUser.role);
      if (!isPrivileged && currentUser.unidade && selectedUnit !== currentUser.unidade) {
        setSelectedUnit(currentUser.unidade);
      }
    }
  }, [currentUser, selectedUnit, setSelectedUnit]);

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const [u, b] = await Promise.all([
        api.getUsers(),
        api.getBaseItems()
      ]);
      setUsersList(u);
      setBaseItems(b);
    } catch (e) {
      console.error("Erro crítico ao conectar com o banco de dados Supabase:", e);
      // Mantivemos vazio para não confundir o usuário com dados fakes
    }
  };

  const loadGlobalAudits = async () => {
    try {
      const data = await api.getAllAutoauditorias(autoauditoriaMesAno);
      setAllAutoauditorias(data || []);
    } catch (e) {
      console.error("Erro ao carregar auditorias globais:", e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadGlobalAudits();
  }, [autoauditoriaMesAno]);

  // Real-time Listeners
  useEffect(() => {
    if (!socket) return;
    const handleAutoauditoriaUpdated = (data: { unidade: string, mesAno: string }) => {
      if (data.mesAno === autoauditoriaMesAno) {
        loadGlobalAudits();
      }
    };
    
    socket.on('autoauditoria_updated', handleAutoauditoriaUpdated);
    return () => {
      socket.off('autoauditoria_updated', handleAutoauditoriaUpdated);
    };
  }, [socket, autoauditoriaMesAno]);


  // Global Styles / Effect
  const theme = useStore(state => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        {currentUser ? (
          <Shell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rank" element={<Rank />} />
              {currentUser.role !== 'AUDITOR' && <Route path="/autoauditoria" element={<Autoauditoria />} />}
              {['ADMIN', 'AUDITOR', 'DIRETORIA', 'GERENTE_DIVISIONAL'].includes(currentUser.role) && <Route path="/avaliacao-externa" element={<AvaliacaoExterna />} />}
              {['ADMIN', 'GERENTE_DIVISIONAL', 'DIRETORIA', 'GERENTE_DO_CD'].includes(currentUser.role) && <Route path="/base-checklist" element={<BaseChecklist />} />}
              {currentUser.role === 'ADMIN' && <Route path="/usuarios" element={<UserManagement />} />}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Shell>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
