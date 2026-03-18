import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import { getBlocoWeight } from '../utils/appUtils';

export const useDashboardStats = (selectedUnit: string, autoauditoriaMesAno: string) => {
  const { items, baseItems, allAutoauditorias } = useStore();

  const dashboardStats = useMemo(() => {
    const vItems = items.filter(i => selectedUnit === 'Todas' ? true : i.unidade === selectedUnit);
    const aItems = vItems.filter(i => i.ativo);
    const tItems = aItems.length;
    const tResp = aItems.filter(i => i.completed).length;
    const tAder = aItems.filter(i => i.completed && i.aderente).length;

    const progTotal = tItems === 0 ? 0 : (tResp / tItems) * 100;
    const aderMedia = tItems === 0 ? 0 : (tAder / tItems) * 100;
    const sGeral = aderMedia >= 80 ? 'Aderente' : 'Não Aderente';

    const currentPilares = PILAR_ORDER;

    const rPorPilar = currentPilares.map(pilar => {
      const pilarBaseItems = baseItems.filter(i => i.pilar === pilar && i.ativo);
      const pilarUnitItems = aItems.filter(i => i.pilar === pilar);

      const pTotal = pilarUnitItems.length;
      const pRespondidos = pilarUnitItems.filter(i => i.completed).length;
      const pAderentes = pilarUnitItems.filter(i => i.completed && i.aderente).length;
      const pNaoAderentes = pRespondidos - pAderentes;

      let totalPoints = 0;
      let possiblePoints = 0;

      if (selectedUnit === 'Todas') {
        (allAutoauditorias || [])
          .filter(a => a.mesAno === autoauditoriaMesAno)
          .forEach(audit => {
            pilarBaseItems.forEach(bi => {
              const ai = audit.items?.find((item: any) => item.baseItemId === bi.id);
              if (ai) {
                possiblePoints += 3;
                if (ai.score === '3') totalPoints += 3;
                else if (ai.score === '1') totalPoints += 1;
              }
            });
          });
      } else {
        const unitAudit = allAutoauditorias.find(a => a.unidade === selectedUnit && a.mesAno === autoauditoriaMesAno);
        possiblePoints = pilarBaseItems.length * 3;
        pilarBaseItems.forEach(bi => {
          const ai = unitAudit?.items?.find((item: any) => item.baseItemId === bi.id);
          if (ai?.score === '3') totalPoints += 3;
          else if (ai?.score === '1') totalPoints += 1;
        });
      }

      const pAuditoriaOficial = possiblePoints === 0 ? 0 : (totalPoints / possiblePoints) * 100;
      const pProgresso = pTotal === 0 ? 0 : (pRespondidos / pTotal) * 100;
      const pAderencia = pTotal === 0 ? 0 : (pAderentes / pTotal) * 100;
      const pStatus = pAderencia >= 80 ? 'Aderente' : 'Não Aderente';

      return {
        pilar,
        total: pTotal,
        conforme: pAderentes,
        naoConforme: pNaoAderentes,
        progresso: pProgresso,
        auditoriaOficial: pAuditoriaOficial,
        aderencia: pAderencia,
        status: pStatus
      };
    });

    return {
      visibleItems: vItems,
      activeItems: aItems,
      totalItems: tItems,
      totalRespondidos: tResp,
      totalAderentes: tAder,
      progressoTotal: progTotal,
      aderenciaMedia: aderMedia,
      statusGeral: sGeral,
      resumoPorPilar: rPorPilar,
      pilares: currentPilares
    };
  }, [items, selectedUnit, allAutoauditorias, baseItems]);

  const matrixStats = useMemo(() => {
    const allPilars = PILAR_ORDER;
    const matrix: Record<string, Record<string, string>> = {};
    const divisions: Record<string, string[]> = {};
    const pilarToBlocks: Record<string, string[]> = {};

    allPilars.forEach(pilar => {
      const pilarBaseItems = baseItems.filter(i => i.pilar === pilar);
      const pilarBlocks = Array.from(new Set(pilarBaseItems.map(i => i.bloco)));
      pilarToBlocks[pilar] = pilarBlocks.sort((a, b) => getBlocoWeight(a) - getBlocoWeight(b));
    });

    UNIDADES_DISPONIVEIS.forEach(unit => {
      const division = CD_REGIONS[unit]?.divisao || 'Outros';
      if (!divisions[division]) divisions[division] = [];
      divisions[division].push(unit);

      matrix[unit] = {};
      const unitAudit = allAutoauditorias.find(a => 
        String(a.unidade) === String(unit) && a.mesAno === autoauditoriaMesAno
      );

      let unitTotalPoints = 0;
      let unitMaxPoints = 0;

      allPilars.forEach(pilar => {
        const pilarBaseItems = baseItems.filter(i => i.pilar === pilar);

        pilarToBlocks[pilar].forEach(bloco => {
          const blocoBaseItems = pilarBaseItems.filter(i => i.bloco === bloco);
          let blocoPoints = 0;
          blocoBaseItems.forEach(bi => {
            const auditItem = unitAudit?.items?.find((ai: any) => ai.baseItemId === bi.id);
            const score = String(auditItem?.score || '');
            if (score === '3') blocoPoints += 3;
            else if (score === '1') blocoPoints += 1;
          });
          const maxBlocoPoints = blocoBaseItems.length * 3;
          matrix[unit][`${pilar}_${bloco}`] = maxBlocoPoints === 0 ? '0' : Math.round((blocoPoints / maxBlocoPoints) * 100).toString();
        });

        if (pilarBaseItems.length === 0) {
          matrix[unit][pilar] = '0';
          return;
        }

        let totalPoints = 0;
        pilarBaseItems.forEach(bi => {
          const auditItem = unitAudit?.items?.find((ai: any) => ai.baseItemId === bi.id);
          const score = String(auditItem?.score || '');
          if (score === '3') totalPoints += 3;
          else if (score === '1') totalPoints += 1;
        });

        unitTotalPoints += totalPoints;
        unitMaxPoints += (pilarBaseItems.length * 3);

        const maxPoints = pilarBaseItems.length * 3;
        const percentage = maxPoints === 0 ? '0' : Math.round((totalPoints / maxPoints) * 100).toString();
        matrix[unit][pilar] = percentage;
      });

      const totalPercentage = unitMaxPoints === 0 ? '0' : Math.round((unitTotalPoints / unitMaxPoints) * 100).toString();
      matrix[unit]['Total'] = totalPercentage;
    });

    const orderedDivisions = Object.keys(divisions).sort((a, b) => {
      if (a === 'SP') return -1;
      if (b === 'SP') return 1;
      return a.localeCompare(b);
    });

    const flatOrderedUnits = orderedDivisions.flatMap(div => divisions[div]);
    const divFirstUnits = new Set(orderedDivisions.map(div => divisions[div][0]));

    // Calculate Averages (TT)
    const pilarAverages: Record<string, string> = {};
    allPilars.forEach(pilar => {
      let pSum = 0;
      flatOrderedUnits.forEach(unit => {
        pSum += parseInt(matrix[unit][pilar] || '0');
      });
      pilarAverages[pilar] = flatOrderedUnits.length === 0 ? '0' : Math.round(pSum / flatOrderedUnits.length).toString();

      pilarToBlocks[pilar].forEach(bloco => {
        let bSum = 0;
        flatOrderedUnits.forEach(unit => {
          bSum += parseInt(matrix[unit][`${pilar}_${bloco}`] || '0');
        });
        pilarAverages[`${pilar}_${bloco}`] = flatOrderedUnits.length === 0 ? '0' : Math.round(bSum / flatOrderedUnits.length).toString();
      });
    });

    let tSum = 0;
    flatOrderedUnits.forEach(unit => {
      tSum += parseInt(matrix[unit]['Total'] || '0');
    });
    pilarAverages['Total'] = flatOrderedUnits.length === 0 ? '0' : Math.round(tSum / flatOrderedUnits.length).toString();

    return { divisions, orderedDivisions, flatOrderedUnits, divFirstUnits, allPilars, matrix, pilarToBlocks, pilarAverages };
  }, [baseItems, allAutoauditorias, autoauditoriaMesAno]);

  return { dashboardStats, matrixStats };
};
