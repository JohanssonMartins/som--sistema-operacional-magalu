import { INITIAL_CHECKLIST } from './src/data';

function computeDashboardStats(selectedUnit: string) {
    const UNIDADES_DISPONIVEIS = ['50', '94', '300', '350', '490', '550', '590', '991', '994', '1100', '1250', '1500', '1800', '2500', '2650', '2900', '5200'];
    const allUnits = UNIDADES_DISPONIVEIS;

    // Generate db.items mock
    const items = [];
    for (const unit of allUnits) {
        for (const baseItem of INITIAL_CHECKLIST) {
            items.push({
                ...baseItem,
                id: `${unit}-${baseItem.id}`,
                unidade: unit,
                assigneeId: ''
            });
        }
    }

    // Simulate user completing an item in '50' for 'Pessoas'
    items.find(i => i.unidade === '50' && i.pilar === 'Pessoas').completed = true;

    const vItems = items.filter(i => selectedUnit === 'Todas' ? true : i.unidade === selectedUnit);
    const aItems = vItems.filter(i => i.ativo);
    const tItems = aItems.length;

    const currentPilares = Array.from(new Set(aItems.map(i => i.pilar)));

    const rPorPilar = currentPilares.map(pilar => {
        const pilarItems = aItems.filter(i => i.pilar === pilar);
        const pTotal = pilarItems.length;
        const pRespondidos = pilarItems.filter(i => i.completed).length;
        return {
            pilar,
            total: pTotal,
            respondidos: pRespondidos,
            progresso: pTotal === 0 ? 0 : (pRespondidos / pTotal) * 100
        };
    });

    return rPorPilar;
}

console.log('Unit 50:', computeDashboardStats('50'));
console.log('Unit Todas:', computeDashboardStats('Todas'));
