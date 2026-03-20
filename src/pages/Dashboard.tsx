import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, RefreshCw, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { dashboardData, CD_NAMES, PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import TrendChart from '../components/TrendChart';
import { api } from '../api';
import { getPerformanceStatus } from '../utils/appUtils';

export const Dashboard = () => {
  const { selectedUnit, setSelectedUnit, autoauditoriaMesAno, setAutoauditoriaMesAno, allAutoauditorias } = useStore();

  const [filterDivisional, setFilterDivisional] = useState<string>('Todas');
  const [filterPilar, setFilterPilar] = useState<string>('Todos');

  const availableMonths = useMemo(() => {
    const months = new Set((allAutoauditorias || []).map(a => a.mesAno).filter(Boolean));
    if (!months.has(autoauditoriaMesAno)) months.add(autoauditoriaMesAno);
    return Array.from(months);
  }, [allAutoauditorias, autoauditoriaMesAno]);

  const cdOptions = useMemo(() => {
    if (filterDivisional === 'Todas') return UNIDADES_DISPONIVEIS;
    return UNIDADES_DISPONIVEIS.filter(u => CD_REGIONS[u]?.divisao === filterDivisional);
  }, [filterDivisional]);

  const { dashboardStats, matrixStats } = useDashboardStats(selectedUnit, autoauditoriaMesAno, filterDivisional, filterPilar);
  const resumoPorPilar = dashboardStats?.resumoPorPilar || [];

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedPilars, setExpandedPilars] = useState<Set<string>>(new Set());

  const togglePilarExpansion = (pilar: string) => {
    const next = new Set(expandedPilars);
    if (next.has(pilar)) next.delete(pilar);
    else next.add(pilar);
    setExpandedPilars(next);
  };

  const getPercentageColor = (value: number, isSubItem = false) => {
    const status = getPerformanceStatus(value);
    if (value > 0) return isSubItem ? `${status.bg}/10 ${status.text} font-bold` : `${status.bg}/10 ${status.text} font-bold`;
    return isSubItem ? 'text-gray-400 dark:text-zinc-500' : 'text-gray-900 dark:text-white';
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (selectedUnit !== 'Todas') {
        try {
          setIsLoadingHistory(true);
          const history = await api.getHistory(selectedUnit);
          setHistoryData(history);
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
          setHistoryData([]);
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setHistoryData([]);
      }
    };
    loadHistory();
  }, [selectedUnit]);

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
              {selectedUnit === 'Todas' ? 'Visão Empresa' : `CD ${selectedUnit}`}
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Exemplo de consolidação após avaliação oficial</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro de Mês */}
            <div className="relative min-w-[150px]">
              <select
                value={autoauditoriaMesAno}
                onChange={(e) => setAutoauditoriaMesAno(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50"
              >
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro Divisional */}
            <div className="relative min-w-[160px]">
              <select
                value={filterDivisional}
                onChange={(e) => {
                  const newDiv = e.target.value;
                  setFilterDivisional(newDiv);
                  if (selectedUnit !== 'Todas' && newDiv !== 'Todas') {
                    if (CD_REGIONS[selectedUnit]?.divisao !== newDiv) {
                      setSelectedUnit('Todas');
                    }
                  }
                }}
                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50"
              >
                <option value="Todas">Todas Divisionais</option>
                <option value="SP">SP</option>
                <option value="Sul / Sudeste">Sul / Sudeste</option>
                <option value="NE/NO/CO">NE/NO/CO</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro CD */}
            <div className="relative min-w-[160px]">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50"
              >
                <option value="Todas">Todos os CDs</option>
                {cdOptions.map(u => (
                  <option key={u} value={u}>CD {u}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filtro Pilar */}
            <div className="relative min-w-[160px]">
              <select
                value={filterPilar}
                onChange={(e) => setFilterPilar(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500/50"
              >
                <option value="Todos">Todos os Pilares</option>
                {PILAR_ORDER.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex justify-end w-full">
          <div className="bg-zinc-900 text-[10px] text-white p-2 rounded-lg flex items-center gap-4 shadow-xl border border-zinc-800 w-fit">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#e34935]" />
              <span className="opacity-70">&lt; 50% →</span>
              <span className="font-bold">Não aderente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="opacity-70">50% a 69.9% →</span>
              <span className="font-bold">Qualificado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#22a06b]" />
              <span className="opacity-70">≥ 70% →</span>
              <span className="font-bold">Certificado</span>
            </div>
          </div>
        </div>
      </div>

      {selectedUnit !== 'Todas' && (
        <div
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-500" /> Histórico de Performance
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500">
              <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
              <span>Mensal Oficial (%)</span>
            </div>
          </div>
          {isLoadingHistory ? (
            <div className="h-[300px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          ) : (
            <TrendChart data={historyData} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.map((card, idx) => {
          const Icon = card.icon;
          let pilarName = card.title;
          if (card.title === 'Clientes') pilarName = 'Cliente';

          const pilarInfo = resumoPorPilar.find(p => p.pilar === pilarName);
          const actualAutoAuditoria = pilarInfo?.aderencia ? Math.round(pilarInfo.aderencia) : 0;
          const actualOficialAuditoria = pilarInfo?.auditoriaOficial ? Math.round(pilarInfo.auditoriaOficial) : 0;
          const dispersao = Math.abs(actualAutoAuditoria - actualOficialAuditoria);
          const dispersaoType = actualAutoAuditoria > actualOficialAuditoria ? 'down' : (actualOficialAuditoria > actualAutoAuditoria ? 'up' : card.dispersaoType);

          return (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 group"
            >
              <div className={`${card.color} px-4 py-3 flex items-center space-x-3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                <div>
                  <Icon className="w-5 h-5 text-white relative z-10" />
                </div>
                <h3 className="text-white font-black text-xl relative z-10 tracking-tight drop-shadow-md">{card.title}</h3>
              </div>

              <div className="p-5 flex gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Objetivo</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-black">&gt; 70%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#6b778c] rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400 font-medium">Autoavaliação</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-black">{actualOficialAuditoria}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getPerformanceStatus(actualOficialAuditoria).bg} rounded-full`} style={{ width: `${actualOficialAuditoria}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center relative pl-4">
                  <div
                    className={`w-28 h-28 rounded-full flex flex-col items-center justify-center p-3 border-[6px] border-white dark:border-zinc-800 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] transition-all duration-300 bg-white dark:bg-zinc-900 relative group`}
                  >
                    {/* Subtle Glow Ring */}
                    <div className={`absolute inset-[-4px] rounded-full border-2 opacity-50 ${getPerformanceStatus(actualOficialAuditoria).bg.replace('bg-', 'border-').replace('/10', '/30')
                      }`} />

                    <span className={`text-[10px] font-black uppercase tracking-widest text-center leading-none mb-2 ${getPerformanceStatus(actualOficialAuditoria).text}`}>
                      {getPerformanceStatus(actualOficialAuditoria).label}
                    </span>
                    <span className={`text-3xl font-black leading-none ${getPerformanceStatus(actualOficialAuditoria).text} drop-shadow-md`}>
                      {actualOficialAuditoria}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUnit === 'Todas' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-lg mt-8">
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-amber-500" /> Matriz de Aderência Consolidada
            </h3>
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Aderência Oficial (% por CD)</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-center text-[11px] sm:text-sm border-collapse matrix-tt-included">
              <thead className="bg-[#1e293b] text-white">
                <tr className="bg-[#0f172a] text-[10px] uppercase tracking-tighter sm:tracking-normal">
                  <th className="px-2 py-2 border-b border-gray-700 sticky left-0 z-20 w-[120px] sm:w-[180px] bg-[#0f172a]"></th>
                  {matrixStats.orderedDivisions.map((div, idx) => (
                    <th
                      key={div}
                      colSpan={matrixStats.divisions[div].length}
                      className={`px-1 py-2 border-b border-gray-700 border-r border-gray-800 ${idx > 0 ? 'border-l-2 border-amber-500/30 bg-[#161e2e]' : ''}`}
                    >
                      <span className="opacity-80">{div}</span>
                    </th>
                  ))}
                  <th rowSpan={2} className="px-2 py-2 border border-gray-700 bg-[#0f172a] text-[10px] min-w-[80px] align-middle shadow-[-2px_0_5px_rgba(0,0,0,0.2)] sticky right-0 z-20">
                    Aderência<br />Pilar TT
                  </th>
                </tr>
                <tr>
                  <th className="px-2 py-3 border border-gray-700 font-bold bg-[#1e293b] sticky left-0 z-20 w-[120px] sm:w-[180px] shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Pilar</th>
                  {matrixStats.flatOrderedUnits.map(unit => {
                    const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                    return (
                      <th
                        key={unit}
                        className={`px-1 py-1 sm:py-3 border border-gray-700 font-bold min-w-[38px] sm:min-w-[42px] ${isFirstInDiv ? 'border-l-4 border-gray-600/50' : ''}`}
                      >
                        {unit}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {matrixStats.allPilars.map(pilar => (
                  <React.Fragment key={pilar}>
                    <tr
                      onClick={() => togglePilarExpansion(pilar)}
                      className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-2 py-3 border border-gray-200 dark:border-zinc-800 font-bold text-left bg-gray-50 dark:bg-zinc-950/50 sticky left-0 z-10 text-gray-900 dark:text-white whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-1">
                          {expandedPilars.has(pilar) ? (
                            <ChevronDown className="w-3 h-3 text-amber-500" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-amber-500" />
                          )}
                          {pilar}
                        </div>
                      </td>
                      {matrixStats.flatOrderedUnits.map(unit => {
                        const value = parseInt(matrixStats.matrix[unit][pilar] || '0');
                        const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                        const colorClass = getPercentageColor(value);

                        return (
                          <td
                            key={`${unit}-${pilar}`}
                            className={`px-1 py-3 border border-gray-200 dark:border-zinc-800 ${colorClass} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                          >
                            {value}%
                          </td>
                        );
                      })}
                      <td className={`px-2 py-3 border border-gray-200 dark:border-zinc-800 font-black bg-gray-50 dark:bg-zinc-950 sticky right-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)] ${getPercentageColor(parseInt(matrixStats.pilarAverages[pilar] || '0'))}`}>
                        {matrixStats.pilarAverages[pilar] || '0'}%
                      </td>
                    </tr>
                    {expandedPilars.has(pilar) && matrixStats.pilarToBlocks[pilar].map(bloco => (
                      <tr
                        key={`${pilar}-${bloco}`}
                        className="bg-gray-100/30 dark:bg-zinc-900/40 text-[10px] sm:text-xs"
                      >
                        <td className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-left bg-gray-100/50 dark:bg-zinc-900/50 sticky left-0 z-10 text-gray-500 dark:text-zinc-400 whitespace-nowrap italic">
                          {bloco}
                        </td>
                        {matrixStats.flatOrderedUnits.map(unit => {
                          const value = parseInt(matrixStats.matrix[unit][`${pilar}_${bloco}`] || '0');
                          const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                          const colorClass = getPercentageColor(value, true);

                          return (
                            <td
                              key={`${unit}-${pilar}-${bloco}`}
                              className={`px-1 py-2 border border-gray-200 dark:border-zinc-800 ${colorClass} ${isFirstInDiv ? 'border-l-4 border-gray-400/20' : ''}`}
                            >
                              {value}%
                            </td>
                          );
                        })}
                        <td className={`px-2 py-2 border border-gray-200 dark:border-zinc-800 font-bold bg-gray-100 dark:bg-zinc-900 sticky right-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] ${getPercentageColor(parseInt(matrixStats.pilarAverages[`${pilar}_${bloco}`] || '0'), true)}`}>
                          {matrixStats.pilarAverages[`${pilar}_${bloco}`] || '0'}%
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
                <tr className="bg-gray-50 dark:bg-zinc-950/50 font-extrabold border-t-2 border-gray-300 dark:border-zinc-700">
                  <td className="px-2 py-3 border border-gray-300 dark:border-zinc-700 text-left sticky left-0 z-10 text-blue-600 dark:text-blue-400 whitespace-nowrap bg-gray-100 dark:bg-zinc-900 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                    Aderência Total
                  </td>
                  {matrixStats.flatOrderedUnits.map(unit => {
                    const value = parseInt(matrixStats.matrix[unit]['Total'] || '0');
                    const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                    const baseColorClass = getPercentageColor(value);
                    const colorClass = baseColorClass.includes('/10')
                      ? baseColorClass.replace('/10', '/20')
                      : baseColorClass; // Slightly stronger background for Total row

                    return (
                      <td
                        key={`${unit}-total`}
                        className={`px-1 py-3 border border-gray-300 dark:border-zinc-700 ${colorClass} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                      >
                        {value}%
                      </td>
                    );
                  })}
                  <td className={`px-2 py-3 border border-gray-300 dark:border-zinc-700 font-black bg-gray-100 dark:bg-zinc-900 sticky right-0 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)] ${getPercentageColor(parseInt(matrixStats.pilarAverages['Total'] || '0')).replace('/10', '/30')}`}>
                    {matrixStats.pilarAverages['Total'] || '0'}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
