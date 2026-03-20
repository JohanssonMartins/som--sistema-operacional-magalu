import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PILAR_ORDER, UNIDADES_DISPONIVEIS, CD_REGIONS } from '../constants/appConstants';
import { getBlocoWeight } from '../utils/appUtils';

export const useDashboardStats = (selectedUnit: string, autoauditoriaMesAno: string, filterDivisional: string = 'Todas', filterPilar: string = 'Todos') => {
  const { baseItems, allAutoauditorias } = useStore();

  const dashboardStats = useMemo(() => {
    const currentPilares = filterPilar === 'Todos' ? PILAR_ORDER : [filterPilar];

    // Pre-group baseItems by pilar to avoid repeated filtering
    const pilarItemsMap = new Map<string, typeof baseItems>();
    currentPilares.forEach(pilar => {
      pilarItemsMap.set(pilar, baseItems.filter(i => i.pilar === pilar && i.ativo));
    });

    const rPorPilar = currentPilares.map(pilar => {
      const pilarBaseItems = pilarItemsMap.get(pilar) || [];

      let totalPoints = 0;
      let possiblePoints = 0;

      if (selectedUnit === 'Todas') {
        const applicableAudits = (allAutoauditorias || [])
          .filter(a => a.mesAno === autoauditoriaMesAno)
          .filter(a => filterDivisional === 'Todas' || CD_REGIONS[String(a.unidade)]?.divisao === filterDivisional);

        applicableAudits.forEach(audit => {
          const auditMap = new Map(audit.items?.map((ai: any) => [ai.baseItemId, ai]) || []);
          pilarBaseItems.forEach(bi => {
            const ai = auditMap.get(bi.id);
            if (ai) {
              possiblePoints += 3;
              if (ai.score === '3') totalPoints += 3;
              else if (ai.score === '1') totalPoints += 1;
            }
          });
        });
      } else {
        const unitAudit = allAutoauditorias.find(a => a.unidade === selectedUnit && a.mesAno === autoauditoriaMesAno);
        const auditMap = new Map(unitAudit?.items?.map((ai: any) => [ai.baseItemId, ai]) || []);

        possiblePoints = pilarBaseItems.length * 3;
        pilarBaseItems.forEach(bi => {
          const ai = auditMap.get(bi.id);
          if (ai?.score === '3') totalPoints += 3;
          else if (ai?.score === '1') totalPoints += 1;
        });
      }

      const pAuditoriaOficial = possiblePoints === 0 ? 0 : (totalPoints / possiblePoints) * 100;

      return {
        pilar,
        auditoriaOficial: pAuditoriaOficial
      };
    });

    return {
      resumoPorPilar: rPorPilar,
      pilares: currentPilares
    };
  }, [selectedUnit, allAutoauditorias, baseItems, autoauditoriaMesAno, filterDivisional, filterPilar]);

  const matrixStats = useMemo(() => {
    const allPilars = filterPilar === 'Todos' ? PILAR_ORDER : [filterPilar];
    const matrix: Record<string, Record<string, string>> = {};
    const divisions: Record<string, string[]> = {};
    const pilarToBlocks: Record<string, string[]> = {};

    // 1. Index baseItems by pilar and bloco for O(1) access
    const groupedBaseItems: Record<string, Record<string, typeof baseItems>> = {};
    const pillarBaseItemsOnly: Record<string, typeof baseItems> = {};

    allPilars.forEach(pilar => {
      const pilarItems = baseItems.filter(i => i.pilar === pilar);
      pillarBaseItemsOnly[pilar] = pilarItems;

      const blocks = Array.from(new Set(pilarItems.map(i => i.bloco)));
      pilarToBlocks[pilar] = blocks.sort((a, b) => getBlocoWeight(a) - getBlocoWeight(b));

      groupedBaseItems[pilar] = {};
      pilarToBlocks[pilar].forEach(bloco => {
        groupedBaseItems[pilar][bloco] = pilarItems.filter(i => i.bloco === bloco);
      });
    });

    // 2. Index allAutoauditorias for current month by unit
    const auditByUnit = new Map<string, any>();
    (allAutoauditorias || []).forEach(a => {
      if (a.mesAno === autoauditoriaMesAno) {
        auditByUnit.set(String(a.unidade), a);
      }
    });

    const unitsToProcess = UNIDADES_DISPONIVEIS.filter(u => filterDivisional === 'Todas' || CD_REGIONS[u]?.divisao === filterDivisional);

    // 3. Main processing loop (Units)
    unitsToProcess.forEach(unit => {
      const division = CD_REGIONS[unit]?.divisao || 'Outros';
      if (!divisions[division]) divisions[division] = [];
      divisions[division].push(unit);

      matrix[unit] = {};
      const unitAudit = auditByUnit.get(String(unit));
      const auditMap = new Map(unitAudit?.items?.map((ai: any) => [ai.baseItemId, ai]) || []);

      let unitTotalPoints = 0;
      let unitMaxPoints = 0;

      allPilars.forEach(pilar => {
        const pilarItems = pillarBaseItemsOnly[pilar];
        let pilarPoints = 0;

        pilarToBlocks[pilar].forEach(bloco => {
          const blocoItems = groupedBaseItems[pilar][bloco];
          let blocoPoints = 0;
          blocoItems.forEach(bi => {
            const auditItem = auditMap.get(bi.id);
            const score = String(auditItem?.score || '');
            if (score === '3') blocoPoints += 3;
            else if (score === '1') blocoPoints += 1;
          });
          pilarPoints += blocoPoints;
          const maxBlocoPoints = blocoItems.length * 3;
          matrix[unit][`${pilar}_${bloco}`] = maxBlocoPoints === 0 ? '0' : Math.round((blocoPoints / maxBlocoPoints) * 100).toString();
        });

        unitTotalPoints += pilarPoints;
        unitMaxPoints += (pilarItems.length * 3);

        const maxPoints = pilarItems.length * 3;
        const percentage = maxPoints === 0 ? '0' : Math.round((pilarPoints / maxPoints) * 100).toString();
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

    // 4. Calculate Averages (TT) efficiently
    const pilarAverages: Record<string, string> = {};
    if (flatOrderedUnits.length > 0) {
      allPilars.forEach(pilar => {
        let pSum = 0;
        flatOrderedUnits.forEach(unit => {
          pSum += parseInt(matrix[unit][pilar] || '0');
        });
        pilarAverages[pilar] = Math.round(pSum / flatOrderedUnits.length).toString();

        pilarToBlocks[pilar].forEach(bloco => {
          let bSum = 0;
          flatOrderedUnits.forEach(unit => {
            bSum += parseInt(matrix[unit][`${pilar}_${bloco}`] || '0');
          });
          pilarAverages[`${pilar}_${bloco}`] = Math.round(bSum / flatOrderedUnits.length).toString();
        });
      });

      let tSum = 0;
      flatOrderedUnits.forEach(unit => {
        tSum += parseInt(matrix[unit]['Total'] || '0');
      });
      pilarAverages['Total'] = Math.round(tSum / flatOrderedUnits.length).toString();
    } else {
      allPilars.forEach(pilar => {
        pilarAverages[pilar] = '0';
        pilarToBlocks[pilar].forEach(bloco => {
          pilarAverages[`${pilar}_${bloco}`] = '0';
        });
      });
      pilarAverages['Total'] = '0';
    }

    return { divisions, orderedDivisions, flatOrderedUnits, divFirstUnits, allPilars, matrix, pilarToBlocks, pilarAverages };
  }, [baseItems, allAutoauditorias, autoauditoriaMesAno, filterDivisional, filterPilar]);

  return { dashboardStats, matrixStats };
};
