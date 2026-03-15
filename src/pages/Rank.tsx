import React from 'react';
import { useStore } from '../store/useStore';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import { TopMagalogLogo } from '../components/Logos';
import { CustomTrophy } from '../components/CustomTrophy';
import { TableSkeleton } from '../components/Skeleton';
import { Download } from 'lucide-react';
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
      if (ai?.score === '3') {
        totalPoints += 3;
      } else if (ai?.score === '1') {
        totalPoints += 1;
      }
      if (ai && ai.score && ai.score !== '') {
        respondidosCount++;
      }
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
      <div className="flex items-center space-x-1.5 bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full border-2 border-yellow-500 shadow-sm transform scale-105" title="1º Lugar">
        <span className="font-extrabold text-sm leading-none pl-0.5">1º</span>
        <CustomTrophy gold className="w-5 h-5 drop-shadow-md" />
      </div>
    );
    if (index === 1) return (
      <div className="flex items-center space-x-1.5 bg-slate-300 text-slate-800 px-2 py-0.5 rounded-full border-2 border-slate-400 shadow-sm opacity-90" title="2º Lugar">
        <span className="font-bold text-xs leading-none pl-0.5">2º</span>
        <CustomTrophy silver className="w-4 h-4 drop-shadow-md" />
      </div>
    );
    if (index === 2) return (
      <div className="flex items-center space-x-1 bg-orange-500 text-orange-50 px-2 py-0.5 rounded-full border-2 border-orange-600 shadow-sm opacity-90" title="3º Lugar">
        <span className="font-bold text-xs leading-none pl-0.5">3º</span>
        <CustomTrophy bronze className="w-4 h-4 drop-shadow-md" />
      </div>
    );
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <TopMagalogLogo />
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-4 pl-1">Acompanhamento consolidado de Aderência Oficial por CD e Pilar.</p>
        </div>

        <div className="flex flex-col gap-3">
            <div className="bg-[#1a1a1a] dark:bg-zinc-900 border border-gray-800 dark:border-zinc-800 rounded-lg p-3 text-sm shadow-md min-w-[320px]">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div>
                  <span className="text-gray-200 font-bold">&lt; 50% &rarr;</span>
                  <span className="text-blue-200 font-bold">Não aderente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div>
                  <span className="text-gray-200 font-bold">50% a 69.9% &rarr;</span>
                  <span className="text-blue-200 font-bold">Qualificado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                  <span className="text-gray-200 font-bold">&ge; 70% &rarr;</span>
                  <span className="text-blue-200 font-bold">Certificado</span>
                </div>
              </div>
            </div>
            
            <button 
                onClick={() => exportUtils.exportRankToExcel(sortedUnits, autoauditoriaMesAno)}
                className="group flex items-center justify-center space-x-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-700 dark:text-zinc-200 px-4 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:bg-gray-50 dark:hover:bg-zinc-700/50 active:scale-95"
            >
                <div className="bg-emerald-500/10 p-1 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <Download className="w-4 h-4 text-emerald-600" />
                </div>
                <span>Exportar Ranking (Excel)</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm p-1">
        {isLoading ? (
          <TableSkeleton rows={10} cols={PILAR_ORDER.length + 2} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center text-sm text-gray-600 dark:text-zinc-300">
              <thead className="bg-[#1e293b] text-white font-medium whitespace-nowrap">
                <tr>
                  <th className="px-6 py-4 text-left border-r border-gray-700 sticky left-0 bg-[#1e293b] uppercase tracking-wider text-xs">UNIDADE</th>
                  <th className="px-6 py-4 font-bold border-r border-gray-700 uppercase tracking-wider text-xs">Aderência Geral</th>
                  {PILAR_ORDER.map(pilar => (
                    <th key={pilar} className="px-4 py-4 uppercase tracking-wider text-xs">{pilar}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {sortedUnits.map(({ unidade, aderenciaGeral, totalGeral, respondidosGeral }) => {
                  const division = CD_REGIONS[unidade]?.divisao || 'Geral';
                  
                  return (
                    <tr key={unidade} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50">
                      <td className="px-6 py-5 font-bold text-gray-900 dark:text-zinc-100 border-r border-gray-200 dark:border-zinc-700 sticky left-0 bg-inherit shadow-[1px_0_0_0_rgba(229,231,235,1)] dark:shadow-[1px_0_0_0_rgba(63,63,70,1)] z-10 w-48">
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(unidade)}
                            <span className="whitespace-nowrap">CD {unidade}</span>
                          </div>
                          <div className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 text-center tracking-wide">
                            {division}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-bold border-r border-gray-200 dark:border-zinc-700 bg-blue-50/30 dark:bg-blue-900/5">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`px-3 py-1.5 rounded-md text-sm shadow-sm ${aderenciaGeral === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                            aderenciaGeral >= 70 ? 'bg-emerald-500 text-white' :
                              aderenciaGeral >= 50 ? 'bg-yellow-400 text-yellow-950 font-bold' :
                                'bg-red-500 text-white'
                            }`}>
                            {aderenciaGeral.toFixed(1).replace('.', ',')}%
                          </span>
                        </div>
                      </td>
                      {PILAR_ORDER.map(pilar => {
                        const pilarBaseItems = baseItems.filter(i => i.pilar === pilar && i.ativo);
                        const unitAudit = allAutoauditorias.find(a => 
                          String(a.unidade) === String(unidade) && a.mesAno === autoauditoriaMesAno
                        );

                        let pilarPoints = 0;
                        let pilarRespondidos = 0;

                        pilarBaseItems.forEach(bi => {
                          const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
                          if (ai?.score === '3') {
                            pilarPoints += 3;
                          } else if (ai?.score === '1') {
                            pilarPoints += 1;
                          }
                          if (ai && ai.score && ai.score !== '') {
                            pilarRespondidos++;
                          }
                        });

                        const pilarMaxPoints = pilarBaseItems.length * 3;
                        const pAderencia = pilarMaxPoints === 0 ? 0 : (pilarPoints / pilarMaxPoints) * 100;

                        return (
                          <td key={`${unidade}-${pilar}`} className="px-4 py-5 border-b border-gray-100 dark:border-zinc-800/80">
                            {pilarMaxPoints > 0 ? (
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
                                <span className={`text-sm font-bold px-2 py-1 rounded shadow-sm ${pAderencia === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                                  pAderencia >= 70 ? 'bg-emerald-500 text-white' :
                                    pAderencia >= 50 ? 'bg-yellow-400 text-yellow-950' :
                                      'bg-red-500 text-white'
                                  }`}>
                                  {pAderencia.toFixed(1).replace('.', ',')}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-300 dark:text-zinc-700 flex justify-center">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
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
