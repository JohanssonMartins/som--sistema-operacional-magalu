import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import { TopMagalogLogo } from '../components/Logos';
import { CustomTrophy } from '../components/CustomTrophy';

export const Rank = () => {
  const { allAutoauditorias, autoauditoriaMesAno, baseItems } = useStore();

  const { unitsWithStats, sortedUnits } = useMemo(() => {
    // 1. Pre-group active base items and active base items by pilar
    const activeBaseItems = baseItems.filter(i => i.ativo);
    const pilarActiveItems: Record<string, typeof baseItems> = {};
    PILAR_ORDER.forEach(pilar => {
      pilarActiveItems[pilar] = activeBaseItems.filter(i => i.pilar === pilar);
    });

    // 2. Index allAutoauditorias by unit for current month
    const auditByUnit = new Map<string, any>();
    (allAutoauditorias || []).forEach(a => {
      if (a.mesAno === autoauditoriaMesAno) {
        auditByUnit.set(String(a.unidade), a);
      }
    });

    // 3. Calculate stats for each unit
    const unitsStats = UNIDADES_DISPONIVEIS.map(unidade => {
      const unitAudit = auditByUnit.get(String(unidade));
      const auditMap = new Map(unitAudit?.items?.map((ai: any) => [ai.baseItemId, ai]) || []);

      let totalPoints = 0;
      let respondidosCount = 0;

      activeBaseItems.forEach(bi => {
        const ai = auditMap.get(bi.id) as any;
        if (ai?.score === '3') totalPoints += 3;
        else if (ai?.score === '1') totalPoints += 1;
        if (ai && ai.score && ai.score !== '') respondidosCount++;
      });

      const maxPoints = activeBaseItems.length * 3;
      const aderenciaGeral = maxPoints === 0 ? 0 : (totalPoints / maxPoints) * 100;

      // Calculate pilar adherence
      const pillarsStats: Record<string, { aderencia: number, respondidos: number, total: number }> = {};
      PILAR_ORDER.forEach(pilar => {
        const pItems = pilarActiveItems[pilar];
        let pPoints = 0;
        let pRespondidos = 0;

        pItems.forEach(bi => {
          const ai = auditMap.get(bi.id) as any;
          if (ai?.score === '3') pPoints += 3;
          else if (ai?.score === '1') pPoints += 1;
          if (ai && ai.score && ai.score !== '') pRespondidos++;
        });

        const pMaxPoints = pItems.length * 3;
        pillarsStats[pilar] = {
          aderencia: pMaxPoints === 0 ? 0 : (pPoints / pMaxPoints) * 100,
          respondidos: pRespondidos,
          total: pItems.length
        };
      });

      return {
        unidade,
        totalGeral: activeBaseItems.length,
        respondidosGeral: respondidosCount,
        aderenciaGeral,
        pillarsStats
      };
    }).filter(u => u.totalGeral > 0);

    const sorted = [...unitsStats].sort((a, b) => b.aderenciaGeral - a.aderenciaGeral);

    return { unitsWithStats: unitsStats, sortedUnits: sorted };
  }, [allAutoauditorias, autoauditoriaMesAno, baseItems]);

  const getRankIcon = (unidade: string) => {
    const index = sortedUnits.findIndex(u => u.unidade === unidade);
    if (index === 0) return (
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1.05, rotate: 0 }}
        className="flex items-center space-x-1.5 bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full border-2 border-yellow-500 shadow-sm" title="1º Lugar"
      >
        <span className="font-extrabold text-sm leading-none pl-0.5">1º</span>
        <CustomTrophy gold className="w-5 h-5 drop-shadow-md" />
      </motion.div>
    );
    if (index === 1) return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center space-x-1.5 bg-slate-300 text-slate-800 px-2 py-0.5 rounded-full border-2 border-slate-400 shadow-sm opacity-90" title="2º Lugar"
      >
        <span className="font-bold text-xs leading-none pl-0.5">2º</span>
        <CustomTrophy silver className="w-4 h-4 drop-shadow-md" />
      </motion.div>
    );
    if (index === 2) return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center space-x-1 bg-orange-500 text-orange-50 px-2 py-0.5 rounded-full border-2 border-orange-600 shadow-sm opacity-90" title="3º Lugar"
      >
        <span className="font-bold text-xs leading-none pl-0.5">3º</span>
        <CustomTrophy bronze className="w-4 h-4 drop-shadow-md" />
      </motion.div>
    );
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto w-full py-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <TopMagalogLogo />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-500 dark:text-zinc-400 text-sm mt-4 pl-1"
          >
            Acompanhamento consolidado de Aderência Oficial por CD e Pilar.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a1a] dark:bg-zinc-900 border border-gray-800 dark:border-zinc-800 rounded-lg p-3 text-sm shadow-md min-w-[320px]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-4 h-4 rounded-full bg-red-600 shadow-sm"></div>
              <span className="text-gray-200 font-bold">&lt; 50% &rarr;</span>
              <span className="text-blue-200 font-bold">Não aderente</span>
              <span className="text-gray-400 text-xs">(Fundo Vermelho)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-sm"></div>
              <span className="text-gray-200 font-bold">50% a 69.9% &rarr;</span>
              <span className="text-blue-200 font-bold">Qualificado</span>
              <span className="text-gray-400 text-xs">(Fundo Amarelo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
              <span className="text-gray-200 font-bold">&ge; 70% &rarr;</span>
              <span className="text-blue-200 font-bold">Certificado</span>
              <span className="text-gray-400 text-xs">(Fundo Verde Esmeralda)</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
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
              {sortedUnits.map(({ unidade, aderenciaGeral, totalGeral, respondidosGeral, pillarsStats }, idx) => {
                const division = CD_REGIONS[unidade]?.divisao || 'Geral';

                return (
                  <motion.tr
                    key={unidade}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800/50"
                  >
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
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className={`px-3 py-1.5 rounded-md text-sm shadow-sm ${aderenciaGeral === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                            aderenciaGeral >= 70 ? 'bg-emerald-500 text-white' :
                              aderenciaGeral >= 50 ? 'bg-yellow-400 text-yellow-950 font-bold' :
                                'bg-red-500 text-white'
                            }`}
                        >
                          {aderenciaGeral.toFixed(1).replace('.', ',')}%
                        </motion.span>
                        {totalGeral > 0 && (
                          <div className="flex items-center space-x-1 mt-1.5 bg-gray-100 dark:bg-zinc-950 px-2 py-0.5 rounded text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700">
                            <span className={respondidosGeral === totalGeral ? "text-emerald-600 dark:text-emerald-500" : "text-gray-900 dark:text-white"}>{respondidosGeral}</span>
                            <span className="text-gray-400 dark:text-zinc-500">/</span>
                            <span className="text-gray-500 dark:text-zinc-400">{totalGeral}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {PILAR_ORDER.map(pilar => {
                      const stat = pillarsStats[pilar];
                      if (!stat) return <td key={`${unidade}-${pilar}`} className="px-4 py-5 border-b border-gray-100 dark:border-zinc-800/80 text-gray-300 dark:text-zinc-700">-</td>;

                      const { aderencia: pAderencia, respondidos: pRespondidos, total: pTotal } = stat;

                      return (
                        <td key={`${unidade}-${pilar}`} className="px-4 py-5 border-b border-gray-100 dark:border-zinc-800/80">
                          {pTotal > 0 ? (
                            <div className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
                              <span className={`text-sm font-bold px-2 py-1 rounded shadow-sm ${pAderencia === 0 ? 'bg-gray-400 dark:bg-zinc-600 text-white' :
                                pAderencia >= 70 ? 'bg-emerald-500 text-white' :
                                  pAderencia >= 50 ? 'bg-yellow-400 text-yellow-950' :
                                    'bg-red-500 text-white'
                                }`}>
                                {pAderencia.toFixed(1).replace('.', ',')}%
                              </span>
                              <div className="flex items-center space-x-1 mt-1.5 bg-gray-100 dark:bg-zinc-950 px-2 py-0.5 rounded text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700">
                                <span className={pRespondidos === pTotal ? "text-emerald-600 dark:text-emerald-500" : "text-gray-900 dark:text-white"}>{pRespondidos}</span>
                                <span className="text-gray-400 dark:text-zinc-500">/</span>
                                <span className="text-gray-500 dark:text-zinc-400">{pTotal}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-zinc-700 flex justify-center">-</span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
