import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import { TopMagalogLogo } from '../components/Logos';
import { CustomTrophy } from '../components/CustomTrophy';
import { TableSkeleton } from '../components/Skeleton';
import { Download, Trophy, Award, Medal } from 'lucide-react';
import { exportUtils } from '../utils/exportUtils';

export const Rank = () => {
  const { allAutoauditorias, autoauditoriaMesAno, baseItems } = useStore();

  const isLoading = allAutoauditorias.length === 0 || baseItems.length === 0;

  const unitsWithPontos = UNIDADES_DISPONIVEIS.map(unidade => {
    const unitAudit = allAutoauditorias.find(a => 
      String(a.unidade) === String(unidade) && a.mesAno === autoauditoriaMesAno
    );
    const activeBaseItems = baseItems.filter(i => i.ativo);

    let totalPoints = 0;
    let respondidosCount = 0;

    activeBaseItems.forEach(bi => {
      const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
      if (ai?.score === '3') totalPoints += 3;
      else if (ai?.score === '1') totalPoints += 1;
      
      if (ai && ai.score && ai.score !== '') respondidosCount++;
    });

    const maxPoints = activeBaseItems.length * 3;
    const aderenciaGeral = maxPoints === 0 ? 0 : (totalPoints / maxPoints) * 100;

    return {
      unidade,
      totalGeral: activeBaseItems.length,
      respondidosGeral: respondidosCount,
      aderenciaGeral
    };
  }).filter(u => u.totalGeral > 0);

  const sortedUnits = [...unitsWithPontos].sort((a, b) => b.aderenciaGeral - a.aderenciaGeral);

  const getRankIcon = (unidade: string) => {
    const index = sortedUnits.findIndex(u => u.unidade === unidade);
    if (index === 0) return (
      <div className="flex items-center space-x-1.5 bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full border-2 border-yellow-500 shadow-sm" title="1º Lugar">
        <Trophy className="w-4 h-4" />
        <span className="font-extrabold text-xs">1º</span>
      </div>
    );
    if (index === 1) return (
      <div className="flex items-center space-x-1.5 bg-slate-300 text-slate-800 px-2.5 py-1 rounded-full border-2 border-slate-400 shadow-sm" title="2º Lugar">
        <Medal className="w-4 h-4" />
        <span className="font-bold text-xs">2º</span>
      </div>
    );
    if (index === 2) return (
      <div className="flex items-center space-x-1.5 bg-orange-500 text-orange-50 px-2.5 py-1 rounded-full border-2 border-orange-600 shadow-sm" title="3º Lugar">
        <Award className="w-4 h-4" />
        <span className="font-bold text-xs">3º</span>
      </div>
    );
    return <span className="text-zinc-400 font-bold text-xs">{index + 1}º</span>;
  };

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <TopMagalogLogo />
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-4">Acompanhamento consolidado de Aderência Oficial por CD e Pilar.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 flex gap-6 text-[10px] font-bold uppercase tracking-wider">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">&lt; 50% Crítico</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-zinc-600 dark:text-zinc-400">50-70% Alerta</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">&gt; 70% Meta</span>
               </div>
            </div>
            
            <button 
                onClick={() => exportUtils.exportRankToExcel(sortedUnits, autoauditoriaMesAno)}
                className="flex items-center justify-center space-x-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-xl text-sm font-black shadow-xl hover:bg-zinc-800 dark:hover:bg-white transition-all active:scale-95"
            >
                <Download className="w-4 h-4" />
                <span>Exportar Ranking (Excel)</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative">
        {isLoading ? (
          <TableSkeleton rows={10} cols={PILAR_ORDER.length + 2} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="px-6 py-5 text-left font-black uppercase text-[10px] tracking-widest sticky left-0 z-20 bg-zinc-900">Unidade</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-widest bg-zinc-800">Geral</th>
                  {PILAR_ORDER.map(pilar => (
                    <th key={pilar} className="px-4 py-5 uppercase text-[10px] tracking-widest opacity-60 font-bold">{pilar}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {sortedUnits.map(({ unidade, aderenciaGeral }) => {
                  const division = CD_REGIONS[unidade]?.divisao || 'Geral';
                  return (
                    <motion.tr 
                      key={unidade} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-200 border-r dark:border-zinc-900 sticky left-0 z-10 bg-white dark:bg-zinc-950">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 flex justify-center">{getRankIcon(unidade)}</div>
                          <div className="flex flex-col items-start">
                             <span className="whitespace-nowrap font-black">CD {unidade}</span>
                             <span className="text-[10px] text-zinc-400 font-bold uppercase">{division}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
                         <span className={`px-3 py-1.5 rounded-lg text-sm font-black shadow-sm inline-block min-w-[65px] ${
                           aderenciaGeral >= 70 ? 'bg-emerald-500 text-white' :
                           aderenciaGeral >= 50 ? 'bg-yellow-400 text-yellow-950' :
                           'bg-red-500 text-white'
                         }`}>
                           {aderenciaGeral.toFixed(1)}%
                         </span>
                      </td>
                      {PILAR_ORDER.map(pilar => {
                        const pilarBaseItems = baseItems.filter(i => i.pilar === pilar && i.ativo);
                        const unitAudit = allAutoauditorias.find(a => 
                          String(a.unidade) === String(unidade) && a.mesAno === autoauditoriaMesAno
                        );
                        let pilarPoints = 0;
                        pilarBaseItems.forEach(bi => {
                          const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
                          if (ai?.score === '3') pilarPoints += 3;
                          else if (ai?.score === '1') pilarPoints += 1;
                        });
                        const pMax = pilarBaseItems.length * 3;
                        const pAder = pMax === 0 ? 0 : (pilarPoints / pMax) * 100;
                        return (
                          <td key={`${unidade}-${pilar}`} className="px-4 py-4">
                            {pMax > 0 ? (
                               <span className={`text-xs font-black ${
                                 pAder >= 70 ? 'text-emerald-500' :
                                 pAder >= 50 ? 'text-yellow-600' :
                                 'text-red-500'
                               }`}>
                                 {pAder.toFixed(0)}%
                               </span>
                            ) : <span className="opacity-20">-</span>}
                          </td>
                        );
                      })}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
