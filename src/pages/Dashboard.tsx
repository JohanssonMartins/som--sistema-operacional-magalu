import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, RefreshCw, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { dashboardData, CD_NAMES } from '../constants/appConstants';
import TrendChart from '../components/TrendChart';
import { api } from '../api';
import { Skeleton, ChartSkeleton, CardSkeleton } from '../components/Skeleton';
import { exportUtils } from '../utils/exportUtils';

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
    if (selectedUnit) loadHistory();
  }, [selectedUnit]);

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light text-gray-900 dark:text-white tracking-tight">
            {selectedUnit === 'Todas' ? 'Visão Empresa' : `CD ${selectedUnit}`}
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Status de performance e aderência operacional</p>
        </div>

        <div className="flex items-center gap-3">
          {selectedUnit !== 'Todas' && (
            <button 
              onClick={() => exportUtils.exportDashboardToPDF(resumoPorPilar, dashboardStats.aderenciaMedia, autoauditoriaMesAno, selectedUnit)}
              className="group flex items-center space-x-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-700 dark:text-zinc-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-700/50 active:scale-95"
            >
              <div className="bg-red-500/10 p-1 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <Download className="w-4 h-4 text-red-600" />
              </div>
              <span>Exportar PDF</span>
            </button>
          )}

          {selectedUnit === 'Todas' && (
            <button 
              onClick={() => exportUtils.exportMatrixToExcel(matrixStats.matrix, matrixStats.flatOrderedUnits, matrixStats.allPilars, autoauditoriaMesAno)}
              className="group flex items-center space-x-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-700 dark:text-zinc-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-700/50 active:scale-95"
            >
              <div className="bg-emerald-500/10 p-1 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                <Download className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Exportar Matriz (Excel)</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={selectedUnit}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
           {resumoPorPilar.map((p: any, idx: number) => (
             <motion.div 
               key={p.pilar}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-gray-200/20 dark:shadow-none hover:border-blue-500/30 transition-all group overflow-hidden relative cursor-pointer"
               onClick={() => togglePilarExpansion(p.pilar)}
             >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-start justify-between mb-2">
                   <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-zinc-400">
                      <BarChart className="w-4 h-4" />
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.aderencia >= 80 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {p.status}
                   </span>
                </div>
                <h4 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">{p.pilar}</h4>
                <div className="flex items-end space-x-2">
                   <span className="text-2xl font-black text-zinc-900 dark:text-white">{p.aderencia.toFixed(1)}%</span>
                   <div className="flex items-center text-[10px] pb-1 text-zinc-400">
                      <div className="w-1 h-1 bg-zinc-300 rounded-full mx-1.5" />
                      <span>{p.conforme}/{p.total} itens</span>
                   </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${p.aderencia}%` }}
                     className={`h-full ${p.aderencia >= 80 ? 'bg-emerald-500' : p.aderencia >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                   />
                </div>
             </motion.div>
           ))}
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg h-full">
              <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                     <BarChart className="w-5 h-5 text-blue-500" /> Matriz de Aderência Consolidada
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-zinc-500">Dados por Unidade e Pilar</p>
                 </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-zinc-800">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                      <th className="p-3 border-b border-gray-200 dark:border-zinc-800 text-left font-bold text-zinc-400 uppercase text-[10px] tracking-widest sticky left-0 z-10 bg-inherit">Pilar</th>
                      {matrixStats.flatOrderedUnits.map(unit => (
                        <th key={unit} className="p-3 border-b border-gray-200 dark:border-zinc-800 text-center font-bold text-zinc-500 text-[10px] whitespace-nowrap min-w-[70px]">
                          {unit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixStats.allPilars.map(pilar => (
                      <tr key={pilar} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="p-3 border-b border-gray-100 dark:border-zinc-800/50 font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50/30 dark:bg-zinc-950/10 sticky left-0 z-10">{pilar}</td>
                        {matrixStats.flatOrderedUnits.map(unit => {
                          const val = Number(matrixStats.matrix[unit]?.[pilar] || 0);
                          return (
                            <td key={`${unit}-${pilar}`} className="p-3 border-b border-gray-100 dark:border-zinc-800/50 text-center">
                              <span className={`px-2 py-1 rounded text-[11px] font-black ${val >= 80 ? 'text-emerald-500' : val >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {val}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="bg-zinc-50 dark:bg-zinc-950/20 font-black">
                      <td className="p-3 border-t-2 border-zinc-200 dark:border-zinc-700 text-left uppercase text-[10px] tracking-widest sticky left-0 z-10 bg-inherit">Geral CD</td>
                      {matrixStats.flatOrderedUnits.map(unit => {
                        const val = Number(matrixStats.matrix[unit]?.['Total'] || 0);
                        return (
                          <td key={`${unit}-total`} className="p-3 border-t-2 border-zinc-200 dark:border-zinc-700 text-center font-black">
                             <div className={`mx-auto w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] ${val >= 80 ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : val >= 50 ? 'border-yellow-400 text-yellow-500 bg-yellow-400/5' : 'border-red-500 text-red-500 bg-red-500/5'}`}>
                               {val}%
                             </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg h-full">
              <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5 text-emerald-500" /> Tendência Mensal
              </h3>
              {selectedUnit === 'Todas' ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-50 dark:bg-zinc-950/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4">
                   <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                      <BarChart className="w-6 h-6" />
                   </div>
                   <p className="text-sm text-zinc-500">Selecione uma unidade específica para visualizar a tendência temporal.</p>
                </div>
              ) : (
                <div className="h-64">
                   {isLoadingHistory ? <ChartSkeleton /> : <TrendChart data={historyData} />}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
