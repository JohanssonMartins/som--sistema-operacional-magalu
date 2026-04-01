import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, RefreshCw, ChevronDown, Users, Shield, Leaf, ShoppingCart, Settings, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_NAMES } from '../constants/appConstants';
import { getPilarWeight, getBlocoWeight } from '../utils/appUtils';
import { AutoauditoriaRow } from '../components/AutoauditoriaRow';
import { api } from '../api';

const PILAR_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  'Pessoas': { icon: Users, color: 'bg-purple-600' },
  'Segurança': { icon: Shield, color: 'bg-slate-600' },
  'Sustentabilidade': { icon: Leaf, color: 'bg-emerald-600' },
  'Cliente': { icon: ShoppingCart, color: 'bg-cyan-500' },
  'Gestão': { icon: Settings, color: 'bg-blue-600' },
  'Armazém': { icon: Package, color: 'bg-orange-500' },
};

// Gera os últimos 12 meses no formato "Mês-Ano"
const gerarUltimosMeses = (quantidade = 12): string[] => {
  const meses: string[] = [];
  for (let i = 0; i < quantidade; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mes = d.toLocaleString('pt-BR', { month: 'long' });
    const ano = d.getFullYear();
    meses.push(`${mes.charAt(0).toUpperCase() + mes.slice(1)}-${ano}`);
  }
  return meses;
};

const MESES_DISPONIVEIS = gerarUltimosMeses();

export const AvaliacaoExterna = () => {
  const {
    currentUser,
    selectedUnit, setSelectedUnit,
    autoauditoriaMesAno,
    avaliacaoExternaData: autoauditoriaData,
    setAvaliacaoExternaData: setAutoauditoriaData,
    baseItems,
    allAutoauditorias,
    setAllAutoauditorias
  } = useStore();

  const [autoReferenceData, setAutoReferenceData] = useState<Record<string, any>>({});

  const [selectedPilarFilter, setSelectedPilarFilter] = useState('Todos');
  const [selectedBlocoFilter, setSelectedBlocoFilter] = useState('Todos');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Mês local — carrega a avaliação do mês selecionado sem alterar o global
  const [localMesAno, setLocalMesAno] = useState(autoauditoriaMesAno);

  const { dashboardStats } = useDashboardStats(selectedUnit, localMesAno);
  const { resumoPorPilar: _rpp } = dashboardStats;

  // Calcular resumo local baseado em autoauditoriaData (dados reais da auto-avaliação)
  const resumoLocal = useMemo(() => {
    const pilaresParaExibir = selectedPilarFilter === 'Todos'
      ? PILAR_ORDER
      : [selectedPilarFilter];

    return pilaresParaExibir.map(pilar => {
      const pilarBaseItems = baseItems.filter(i =>
        i.pilar === pilar &&
        i.ativo &&
        (selectedBlocoFilter === 'Todos' || i.bloco === selectedBlocoFilter)
      );
      const total = pilarBaseItems.length;
      let conforme = 0; // score === '3'
      let parcial = 0;  // score === '1'
      let naoConforme = 0; // score === '0'
      let respondidos = 0;
      let totalPoints = 0;
      const maxPoints = total * 3;

      pilarBaseItems.forEach(bi => {
        const s = autoauditoriaData[bi.id]?.score;
        if (s === '3') { conforme++; respondidos++; totalPoints += 3; }
        else if (s === '1') { parcial++; respondidos++; totalPoints += 1; }
        else if (s === '0') { naoConforme++; respondidos++; }
      });

      const aderencia = maxPoints === 0 ? 0 : (totalPoints / maxPoints) * 100;
      const status = aderencia >= 80 ? 'Aderente' : 'Não Aderente';
      return { pilar, total, conforme, parcial, naoConforme, respondidos, aderencia, status };
    }).filter(row => row.total > 0);
  }, [baseItems, autoauditoriaData, selectedPilarFilter, selectedBlocoFilter]);

  const itemsForStats = useMemo(() => {
    return baseItems.filter(i =>
      i.ativo &&
      (selectedPilarFilter === 'Todos' || i.pilar === selectedPilarFilter) &&
      (selectedBlocoFilter === 'Todos' || i.bloco === selectedBlocoFilter)
    );
  }, [baseItems, selectedPilarFilter, selectedBlocoFilter]);

  const totalItems = useMemo(() => itemsForStats.length, [itemsForStats]);
  const totalRespondidos = useMemo(() => {
    return itemsForStats.filter(bi => {
      const s = autoauditoriaData[bi.id]?.score;
      return s === '3' || s === '1' || s === '0';
    }).length;
  }, [itemsForStats, autoauditoriaData]);

  const totalPoints = useMemo(() => {
    return itemsForStats.reduce((acc, bi) => {
      const s = autoauditoriaData[bi.id]?.score;
      if (s === '3') return acc + 3;
      if (s === '1') return acc + 1;
      return acc;
    }, 0);
  }, [itemsForStats, autoauditoriaData]);

  const maxPossiblePoints = useMemo(() => itemsForStats.length * 3, [itemsForStats]);
  const aderenciaMedia = maxPossiblePoints === 0 ? 0 : (totalPoints / maxPossiblePoints) * 100;
  const progressoTotal = totalItems === 0 ? 0 : (totalRespondidos / totalItems) * 100;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Blocos disponíveis para o Pilar selecionado
  const blocosDisponiveis = useMemo(() => {
    if (selectedPilarFilter === 'Todos') return [];
    return Array.from(
      new Set(baseItems.filter(i => i.pilar === selectedPilarFilter && i.ativo).map(i => i.bloco))
    ).sort((a, b) => getBlocoWeight(a) - getBlocoWeight(b));
  }, [baseItems, selectedPilarFilter]);

  // Limpar bloco ao trocar pilar
  useEffect(() => {
    setSelectedBlocoFilter('Todos');
  }, [selectedPilarFilter]);

  const isInitialLoad = useRef(true);
  const needsSave = useRef(false);
  const pendingEdits = useRef<Set<string>>(new Set());

  const loadAutoauditoria = async (unidade: string, mesAno: string, isPolling = false) => {
    try {
      if (!isPolling) {
        setIsLoading(true);
        isInitialLoad.current = true;
      }

      // Busca as duas avaliações em paralelo: a do Auditor (EXTERNA) e a do CD (AUTO)
      const [externaData, autoData] = await Promise.all([
        api.getAutoauditoria(unidade, mesAno, 'EXTERNA'),
        api.getAutoauditoria(unidade, mesAno, 'AUTO')
      ]);

      // 1. Mapeia a avaliação do Auditor (scores)
      if (externaData && externaData.items) {
        const mappedExterna: Record<string, any> = {};
        externaData.items.forEach((item: any) => {
          mappedExterna[item.baseItemId] = {
            score: item.score || '',
            nossaAcao: item.nossaAcao || '',
            evidencias: item.evidencias || []
          };
        });
        setAutoauditoriaData(mappedExterna);
      } else {
        if (!isPolling) setAutoauditoriaData({});
      }

      // 2. Mapeia a avaliação do CD (Referência para Plano e Evidências)
      if (autoData && autoData.items) {
        const mappedAuto: Record<string, any> = {};
        autoData.items.forEach((item: any) => {
          mappedAuto[item.baseItemId] = {
            score: item.score || '',
            nossaAcao: item.nossaAcao || '',
            evidencias: item.evidencias || []
          };
        });
        setAutoReferenceData(mappedAuto);
      } else {
        setAutoReferenceData({});
      }

      if (!isPolling) setLastSavedTime(null);
    } catch (e) {
      console.error("Erro ao carregar auditorias:", e);
      if (!isPolling) {
        setAutoauditoriaData({});
        setAutoReferenceData({});
      }
    } finally {
      if (!isPolling) {
        setIsLoading(false);
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    }
  };

  useEffect(() => {
    setAutoauditoriaData({});
    if (selectedUnit && selectedUnit !== 'Todas' && selectedUnit !== 'Master') {
      loadAutoauditoria(selectedUnit, localMesAno);
    }
  }, [selectedUnit, localMesAno]);

  // Debounced Auto-save
  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;
    if (Object.keys(autoauditoriaData).length === 0) return;
    if (selectedUnit === 'Todas' || selectedUnit === 'Master') return;

    if (!needsSave.current) return;

    setIsSaving(true);
    const timeoutId = setTimeout(async () => {
      const savingIds = new Set(pendingEdits.current);
      try {
        const itemsToSave = Object.keys(autoauditoriaData).map(baseItemId => ({
          baseItemId,
          score: autoauditoriaData[baseItemId].score,
          nossaAcao: autoauditoriaData[baseItemId].nossaAcao,
        }));

        await api.saveAutoauditoria({
          unidade: selectedUnit,
          mesAno: localMesAno,
          tipo: 'EXTERNA',
          items: itemsToSave
        });

        savingIds.forEach(id => pendingEdits.current.delete(id));
        needsSave.current = pendingEdits.current.size > 0;
        setLastSavedTime(new Date());
      } catch (e) {
        console.error("Erro no auto-save:", e);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [autoauditoriaData, selectedUnit, autoauditoriaMesAno, currentUser]);

  const handlePontoChange = (itemId: string, newPonto: string) => {
    pendingEdits.current.add(itemId);
    needsSave.current = true;
    setAutoauditoriaData(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { nossaAcao: '' }), score: newPonto }
    }));
  };

  const handleNossaAcaoChange = (itemId: string, newAcao: string) => {
    setAutoauditoriaData(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || { score: '' }), nossaAcao: newAcao }
    }));
  };

  const handleEvidenciaUploaded = (itemId: string, url: string, evidenceId: string) => {
    setAutoauditoriaData(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { score: '', nossaAcao: '' }),
        evidencias: [{ name: evidenceId, url, category: 'Drive' }]
      }
    }));
    // Forçar auto-save
    pendingEdits.current.add(itemId);
    needsSave.current = true;
  };

  const handleNossaAcaoBlur = (itemId: string, finalAcao: string) => {
    pendingEdits.current.add(itemId);
    needsSave.current = true;
    // Trigger save via useEffect
    setAutoauditoriaData(prev => ({ ...prev }));
  };

  const canEdit = currentUser && ['ADMIN', 'AUDITOR', 'DIRETORIA'].includes(currentUser.role) &&
    (currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'DIRETORIA');

  const filteredItems = baseItems
    .filter(i => i.ativo &&
      (selectedPilarFilter === 'Todos' || i.pilar === selectedPilarFilter) &&
      (selectedBlocoFilter === 'Todos' || i.bloco === selectedBlocoFilter) &&
      (!showOnlyPending || !(autoauditoriaData[i.id]?.score))
    )
    .sort((a, b) => {
      const wA = getPilarWeight(a.pilar);
      const wB = getPilarWeight(b.pilar);
      if (wA !== wB) return wA - wB;
      return getBlocoWeight(a.bloco) - getBlocoWeight(b.bloco);
    });

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'GERENTE_DIVISIONAL' || currentUser?.role === 'DIRETORIA' || currentUser?.role === 'AUDITOR';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto w-full py-8 space-y-6"
    >

      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Avaliação Externa do CD</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">
              Realize a auditoria externa — <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUnit !== 'Todas' ? `CD ${selectedUnit}` : 'Selecione um CD'}</span> · {localMesAno}
            </p>
          </div>

          {/* Status de salvamento */}
          <div className="flex items-center gap-3 shrink-0">
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!isSaving && lastSavedTime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-emerald-600 dark:text-emerald-400 text-xs"
              >
                Salvo às {lastSavedTime.toLocaleTimeString()}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Barra de Filtros ── */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-sm">

          {/* CD */}
          {isPrivileged && (
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">Selecione o CD</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer min-w-[200px]"
              >
                <option value="Todas">Todos os CDs</option>
                {UNIDADES_DISPONIVEIS.map(u => (
                  <option key={u} value={u}>CD {CD_NAMES[u]?.split(' - ')[0]} — {CD_NAMES[u]?.split(' - ').slice(1).join(' - ')}</option>
                ))}
              </select>
            </div>
          )}

          <div className="h-8 w-px bg-gray-200 dark:bg-zinc-700 hidden md:block" />

          {/* Pilar */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">Pilar</label>
            <select
              value={selectedPilarFilter}
              onChange={(e) => setSelectedPilarFilter(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
            >
              <option value="Todos">Todos os Pilares</option>
              {PILAR_ORDER.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Bloco */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">Bloco</label>
            <select
              value={selectedBlocoFilter}
              onChange={(e) => setSelectedBlocoFilter(e.target.value)}
              disabled={selectedPilarFilter === 'Todos'}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
            >
              <option value="Todos">Todos os Blocos</option>
              {blocosDisponiveis.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-zinc-700 hidden md:block" />

          {/* Mês */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-1">Mês</label>
            <select
              value={localMesAno}
              onChange={(e) => setLocalMesAno(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer min-w-[170px]"
            >
              {MESES_DISPONIVEIS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto">
            <button
              onClick={() => setShowOnlyPending(!showOnlyPending)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${showOnlyPending
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                : 'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
            >
              {showOnlyPending ? '✓ Mostrando Pendentes' : 'Ver Pendências'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-zinc-800 border-b border-gray-200 dark:border-zinc-800 p-6 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{progressoTotal.toFixed(1).replace('.', ',')}%</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Progresso</div>
            <div className="text-xs text-gray-400 dark:text-zinc-500">({totalRespondidos}/{totalItems} itens)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{aderenciaMedia.toFixed(1).replace('.', ',')}%</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Aderência Auditor</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${aderenciaMedia >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {aderenciaMedia >= 80 ? 'Aderente' : 'Não Aderente'}
            </div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Status</div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200">Resumo por Pilar</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
            <thead className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 font-bold">
              <tr>
                <th className="px-6 py-4 text-left">Pilar</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-emerald-600">Conforme</th>
                <th className="px-6 py-4 text-amber-500">Parcial</th>
                <th className="px-6 py-4 text-red-600">N. Conforme</th>
                <th className="px-6 py-4">Aderência</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {resumoLocal.map(row => (
                <tr key={row.pilar} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 text-left min-w-[220px]">
                    <div className="flex items-center gap-2.5">
                      {(() => {
                        const cfg = PILAR_CONFIG[row.pilar];
                        if (!cfg) return null;
                        const Icon = cfg.icon;
                        return (
                          <div className={`${cfg.color} p-1.5 rounded-lg shrink-0`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 dark:text-zinc-100">{row.pilar}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: row.total === 0 ? '0%' : `${(row.respondidos / row.total) * 100}%` }}
                              className="h-full bg-blue-500 rounded-full"
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-400 dark:text-zinc-500 shrink-0">
                            {row.respondidos}/{row.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{row.total}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{row.conforme}</td>
                  <td className="px-6 py-4 font-bold text-amber-500">{row.parcial}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{row.naoConforme}</td>
                  <td className="px-6 py-4">{row.aderencia.toFixed(1).replace('.', ',')}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${row.status === 'Aderente' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedUnit === 'Todas' ? (
            <motion.div
              key="no-unit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-zinc-400"
            >
              <LayoutDashboard className="w-16 h-16 mb-4 text-gray-300 dark:text-zinc-700" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-300 mb-2">Visão Geral dos CDs</h3>
              <p className="max-w-md">Selecione um CD específico no menu lateral para realizar a autoavaliação detalhada.</p>
            </motion.div>
          ) : (
            <motion.div
              key="unit-selected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-x-auto"
            >
              <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300">
                <thead className="bg-gray-50 dark:bg-zinc-950 font-bold border-b border-gray-200 dark:border-zinc-800 uppercase text-[10px] tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Pilar</th>
                    <th className="px-6 py-3">Bloco</th>
                    <th className="px-6 py-3">Trilha</th>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 w-32 text-center">CD / Auditor</th>
                    <th className="px-6 py-3 w-32 text-center">Plano</th>
                    <th className="px-6 py-3 w-40 text-center">Evidência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map(item => (
                      <AutoauditoriaRow
                        key={item.id}
                        item={item}
                        canEdit={!!canEdit}
                        pontoValue={autoauditoriaData[item.id]?.score || ''}
                        // Prioriza o que o Auditor preencheu, senão mostra o do CD para validação
                        nossaAcaoValue={autoauditoriaData[item.id]?.nossaAcao || autoReferenceData[item.id]?.nossaAcao || ''}
                        evidencias={(() => {
                          const auditorEvs = autoauditoriaData[item.id]?.evidencias || [];
                          const cdEvs = autoReferenceData[item.id]?.evidencias || [];
                          // Combina os dois, priorizando o do Auditor se houver duplicata de nome (raro)
                          const combined = [...auditorEvs];
                          cdEvs.forEach((cdEv: any) => {
                            if (!combined.find(ae => ae.name === cdEv.name)) {
                              combined.push(cdEv);
                            }
                          });
                          return combined;
                        })()}
                        onPontoChange={handlePontoChange}
                        onNossaAcaoChange={handleNossaAcaoChange}
                        onNossaAcaoBlur={handleNossaAcaoBlur}
                        onEvidenciaUploaded={handleEvidenciaUploaded}
                        unidade={selectedUnit}
                        mesAno={localMesAno}
                        tipo="EXTERNA"
                        isNossaAcaoReadOnly={true}
                        isEvidenceReadOnly={currentUser?.role === 'AUDITOR'}
                        cdPontoValue={autoReferenceData[item.id]?.score || ''}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
