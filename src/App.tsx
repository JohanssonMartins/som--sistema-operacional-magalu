import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
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
    <MainLogo className="animate-pulse" size="large" />
    <div className="mt-8 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
    selectedUnit
  } = useStore();

  const { onEvent } = useRealtime();

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
      console.error("Erro ao carregar dados iniciais:", e);
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
  onEvent('autoauditoria_updated', (data: { unidade: string, mesAno: string }) => {
    if (data.mesAno === autoauditoriaMesAno) {
      loadGlobalAudits();
    }
  });


  // Global Styles / Effect
  const theme = useStore(state => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/" replace />}
          />

          <Route
            path="/"
            element={
              currentUser ? (
                <Shell>
                  <Dashboard />
                </Shell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/rank"
            element={
              currentUser ? (
                <Shell>
                  <Rank />
                </Shell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/autoauditoria"
            element={
              currentUser ? (
                <Shell>
                  <Autoauditoria />
                </Shell>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/avaliacao-externa"
            element={
              currentUser && ['ADMIN', 'AUDITOR', 'DIRETORIA', 'GERENTE_DIVISIONAL'].includes(currentUser.role) ? (
                <Shell>
                  <AvaliacaoExterna />
                </Shell>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/base-checklist"
            element={
              currentUser && ['ADMIN', 'GERENTE_DIVISIONAL', 'DIRETORIA', 'GERENTE_DO_CD'].includes(currentUser.role) ? (
                <Shell>
                  <BaseChecklist />
                </Shell>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/usuarios"
            element={
              currentUser && currentUser.role === 'ADMIN' ? (
                <Shell>
                  <UserManagement />
                </Shell>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
