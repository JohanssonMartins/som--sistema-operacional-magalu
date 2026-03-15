import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import { api } from './api';
import { useRealtime } from './hooks/useRealtime';
import { useChecklistSync } from './hooks/useChecklistSync';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Rank } from './pages/Rank';
import { Autoauditoria } from './pages/Autoauditoria';
import { UserManagement } from './pages/UserManagement';
import { BaseChecklist } from './pages/BaseChecklist';

// Components
import { Shell } from './components/Shell';

export const App = () => {
  const { 
    currentUser, 
    setUsersList, 
    setBaseItems, 
    setItems,
    autoauditoriaMesAno,
    setAllAutoauditorias,
    selectedUnit,
    setHistoryData
  } = useStore();

  const { onEvent } = useRealtime();
  useChecklistSync();

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const [u, b, i] = await Promise.all([
        api.getUsers(),
        api.getBaseItems(),
        api.getChecklists()
      ]);
      setUsersList(u);
      setBaseItems(b);
      setItems(i);
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
    loadGlobalAudits();
  }, [autoauditoriaMesAno]);

  // Real-time Listeners
  onEvent('autoauditoria_updated', (data: { unidade: string, mesAno: string }) => {
    if (data.mesAno === autoauditoriaMesAno) {
      loadGlobalAudits();
    }
  });

  onEvent('history_updated', (data: { unidade: string }) => {
    if (data.unidade === selectedUnit) {
      api.getHistory(selectedUnit).then(setHistoryData).catch(console.error);
    }
  });

  // Global Styles / Effect
  useEffect(() => {
    const theme = useStore.getState().theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
