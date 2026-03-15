import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, RefreshCw, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { dashboardData, CD_NAMES } from '../constants/appConstants';
import TrendChart from '../components/TrendChart';
import { api } from '../api';

export const Dashboard = () => {
  const { selectedUnit, autoauditoriaMesAno } = useStore();
  const { dashboardStats, matrixStats } = useDashboardStats(selectedUnit, autoauditoriaMesAno);
  const { resumoPorPilar } = dashboardStats;

  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [expandedPilars, setExpandedPilars] = useState<Set<string>>(new Set());

  const togglePilarExpansion = (pilar: string) => {
    const next = new Set(expandedPilars);
    if (next.has(pilar)) next.delete(pilar);
    else next.add(pilar);
    setExpandedPilars(next);
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
      <div>
        <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
          {selectedUnit === 'Todas' ? 'Visão Empresa' : `CD ${selectedUnit}`}
        </h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Exemplo de consolidação após avaliação oficial</p>
      </div>

      {selectedUnit !== 'Todas' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
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
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <TrendChart data={historyData} />
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.map((card, idx) => {
          const Icon = card.icon;
          let pilarName = card.title;
          if (card.title === 'Clientes') pilarName = 'Cliente';

          const pilarInfo = resumoPorPilar.find(p => p.pilar === pilarName);
          const actualAutoAuditoria = pilarInfo ? Math.round(pilarInfo.aderencia) : 0;
          const actualOficialAuditoria = pilarInfo ? Math.round((pilarInfo as any).auditoriaOficial || 0) : 0;
          const dispersao = Math.abs(actualAutoAuditoria - actualOficialAuditoria);
          let dispersaoType = actualAutoAuditoria > actualOficialAuditoria ? 'down' : (actualOficialAuditoria > actualAutoAuditoria ? 'up' : card.dispersaoType);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-lg hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 group"
            >
              <div className={`${card.color} px-4 py-3 flex items-center space-x-3 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: (idx * 0.1) + 0.3, duration: 0.5 }}>
                  <Icon className="w-5 h-5 text-white relative z-10" />
                </motion.div>
                <h3 className="text-white font-semibold text-lg relative z-10">{card.title}</h3>
              </div>

              <div className="p-5 flex gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400">Objetivo</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-bold">{card.objetivo}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${card.objetivo}%` }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "easeOut" }} className="h-full bg-[#6b778c] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400">Autoavaliação</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualAutoAuditoria}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${actualAutoAuditoria}%` }} transition={{ duration: 1, delay: 0.7 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.autoColor} rounded-full`} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-zinc-400">Avaliação Oficial</span>
                      <span className="text-gray-900 dark:text-zinc-200 font-bold">{actualOficialAuditoria}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${actualOficialAuditoria}%` }} transition={{ duration: 1, delay: 0.9 + (idx * 0.1), ease: "easeOut" }} className={`h-full ${card.oficialColor} rounded-full`} />
                    </div>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.2 + (idx * 0.1), type: "spring" }} className="w-24 bg-gray-50 dark:bg-zinc-800/50 rounded-lg flex flex-col items-center justify-center p-2 border border-gray-200 dark:border-zinc-700/30 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-default">
                  <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium mb-2 uppercase tracking-wider">Dispersão</span>
                  <div className={`flex items-center space-x-1 font-bold text-xl whitespace-nowrap ${dispersaoType === 'up' ? 'text-[#36b37e]' : 'text-[#e34935]'}`}>
                    {dispersaoType === 'up' ? (
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div>
                    ) : (
                      <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                    )}
                    <span className="flex items-baseline space-x-1"><span>{dispersao}</span> <span className="text-sm">pp</span></span>
                    {dispersaoType === 'up' ? (
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowUp className="w-4 h-4" strokeWidth={3} /></motion.div>
                    ) : (
                      <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.2 }}><ArrowDown className="w-4 h-4" strokeWidth={3} /></motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
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
            <table className="w-full text-center text-[11px] sm:text-sm border-collapse">
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
                        let bgColor = 'text-gray-900 dark:text-white';
                        if (value >= 70) bgColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                        else if (value >= 50) bgColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold';
                        else if (value > 0) bgColor = 'bg-red-500/10 text-red-600 dark:text-red-400 font-bold';

                        return (
                          <td
                            key={`${unit}-${pilar}`}
                            className={`px-1 py-3 border border-gray-200 dark:border-zinc-800 ${bgColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                          >
                            {value}%
                          </td>
                        );
                      })}
                    </tr>
                    {expandedPilars.has(pilar) && matrixStats.pilarToBlocks[pilar].map(bloco => (
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${pilar}-${bloco}`}
                        className="bg-gray-100/30 dark:bg-zinc-900/40 text-[10px] sm:text-xs"
                      >
                        <td className="px-4 py-2 border border-gray-200 dark:border-zinc-800 text-left bg-gray-100/50 dark:bg-zinc-900/50 sticky left-0 z-10 text-gray-500 dark:text-zinc-400 whitespace-nowrap italic">
                          {bloco}
                        </td>
                        {matrixStats.flatOrderedUnits.map(unit => {
                          const value = parseInt(matrixStats.matrix[unit][`${pilar}_${bloco}`] || '0');
                          const isFirstInDiv = matrixStats.divFirstUnits.has(unit);
                          let textColor = 'text-gray-400 dark:text-zinc-500';
                          if (value > 0) textColor = 'text-gray-600 dark:text-zinc-300 font-medium';

                          return (
                            <td
                              key={`${unit}-${pilar}-${bloco}`}
                              className={`px-1 py-2 border border-gray-200 dark:border-zinc-800 ${textColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/20' : ''}`}
                            >
                              {value}%
                            </td>
                          );
                        })}
                      </motion.tr>
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
                    let bgColor = 'text-gray-900 dark:text-white';
                    if (value >= 70) bgColor = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
                    else if (value >= 50) bgColor = 'bg-amber-500/20 text-amber-600 dark:text-amber-400';
                    else if (value > 0) bgColor = 'bg-red-500/20 text-red-600 dark:text-red-400';

                    return (
                      <td
                        key={`${unit}-total`}
                        className={`px-1 py-3 border border-gray-300 dark:border-zinc-700 ${bgColor} ${isFirstInDiv ? 'border-l-4 border-gray-400/30' : ''}`}
                      >
                        {value}%
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
