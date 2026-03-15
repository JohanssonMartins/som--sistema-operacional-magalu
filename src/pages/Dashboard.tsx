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
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
           {resumoPorPilar.map((p: any, idx: number) => {
             const config = dashboardData.find(d => d.title === p.pilar) || dashboardData[0];
             const Icon = config.icon;
             
             return (
               <motion.div 
                 key={p.pilar}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.05 }}
                 className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden"
               >
                  <div className={`${config.color} px-4 py-2.5 flex items-center gap-2 text-white`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-bold tracking-tight">{p.pilar}</span>
                  </div>
                  
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Objetivo */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">
                          <span>Objetivo</span>
                          <span>{config.objetivo}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-400 dark:bg-zinc-600 rounded-full" style={{ width: `${config.objetivo}%` }} />
                        </div>
                      </div>

                      {/* Autoavaliação */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">
                          <span>Autoavaliação</span>
                          <span>{p.aderencia.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.aderencia}%` }}
                            className={`h-full rounded-full ${p.aderencia >= 80 ? 'bg-emerald-500' : p.aderencia >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                          />
                        </div>
                      </div>

                      {/* Avaliação Oficial */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-1">
                          <span>Avaliação Oficial</span>
                          <span>{p.auditoriaOficial.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.auditoriaOficial}%` }}
                            className={`h-full rounded-full ${p.auditoriaOficial >= 80 ? 'bg-emerald-500' : p.auditoriaOficial >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 min-w-[80px]">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Dispersão</span>
                      <div className={`flex items-center gap-1 font-black text-lg ${p.auditoriaOficial >= p.aderencia ? 'text-emerald-500' : 'text-red-500'}`}>
                        {p.auditoriaOficial >= p.aderencia ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span>{Math.abs(p.auditoriaOficial - p.aderencia).toFixed(0)} <span className="text-[10px]">pp</span></span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{p.auditoriaOficial >= p.aderencia ? 'Melhoria' : 'Abaixo'}</span>
                    </div>
                  </div>
               </motion.div>
             );
           })}
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
                    <tr className="bg-zinc-100/50 dark:bg-zinc-950/50 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border-b border-gray-200 dark:border-zinc-800">
                      <th className="p-2 border-r border-gray-200 dark:border-zinc-800 sticky left-0 z-20 bg-inherit min-w-[150px]"></th>
                      {matrixStats.orderedDivisions.map(div => (
                        <th key={div} colSpan={matrixStats.divisions[div].length} className="p-2 border-r border-gray-200 dark:border-zinc-800 text-center">
                          {div}
                        </th>
                      ))}
                    </tr>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/20">
                      <th className="p-3 border-b border-r border-gray-200 dark:border-zinc-800 text-left font-bold text-zinc-500 uppercase text-[10px] tracking-widest sticky left-0 z-20 bg-inherit">Pilar</th>
                      {matrixStats.flatOrderedUnits.map(unit => (
                        <th key={unit} className="p-3 border-b border-gray-200 dark:border-zinc-800 text-center font-bold text-zinc-500 text-[10px] whitespace-nowrap min-w-[60px]">
                          {unit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixStats.allPilars.map(pilar => (
                      <React.Fragment key={pilar}>
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                          <td className="p-3 border-b border-r border-gray-100 dark:border-zinc-800/50 font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50/10 dark:bg-zinc-950/5 sticky left-0 z-10 flex items-center gap-2">
                             <button onClick={() => togglePilarExpansion(pilar)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded transition-colors text-zinc-400">
                                {expandedPilars.has(pilar) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                             </button>
                             {pilar}
                          </td>
                          {matrixStats.flatOrderedUnits.map(unit => {
                            const val = Number(matrixStats.matrix[unit]?.[pilar] || 0);
                            return (
                              <td key={`${unit}-${pilar}`} className="p-3 border-b border-gray-100 dark:border-zinc-800/50 text-center font-bold">
                                <span className={`text-[11px] ${val >= 80 ? 'text-emerald-500' : val >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                                  {val}%
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                        
                        {/* Sub-itens (Blocos) */}
                        <AnimatePresence>
                          {expandedPilars.has(pilar) && matrixStats.pilarToBlocks[pilar]?.map(bloco => (
                            <motion.tr 
                              key={`${pilar}-${bloco}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50/30 dark:bg-zinc-950/20 text-[11px]"
                            >
                              <td className="pl-10 p-2 border-b border-r border-gray-100 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-medium italic sticky left-0 z-10 bg-inherit">
                                {bloco}
                              </td>
                              {matrixStats.flatOrderedUnits.map(unit => {
                                const val = Number(matrixStats.matrix[unit]?.[`${pilar}_${bloco}`] || 0);
                                return (
                                  <td key={`${unit}-${pilar}-${bloco}`} className="p-2 border-b border-gray-100 dark:border-zinc-800/50 text-center text-xs opacity-80">
                                    {val}%
                                  </td>
                                );
                              })}
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                    <tr className="bg-blue-50/30 dark:bg-blue-500/5 font-black uppercase text-[10px]">
                      <td className="p-4 border-t-2 border-blue-200 dark:border-blue-900 text-left tracking-widest sticky left-0 z-10 bg-inherit text-blue-600 dark:text-blue-400">Aderência Total</td>
                      {matrixStats.flatOrderedUnits.map(unit => {
                        const val = Number(matrixStats.matrix[unit]?.['Total'] || 0);
                        return (
                          <td key={`${unit}-total`} className="p-4 border-t-2 border-blue-200 dark:border-blue-900 text-center">
                             <div className={`mx-auto font-black ${val >= 80 ? 'text-emerald-500' : val >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
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
