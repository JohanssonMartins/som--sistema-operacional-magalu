import { INITIAL_CHECKLIST } from './src/data';

function testMath() {
    const pilar = 'Pessoas';
    const UNITS = 17;
    const pilarItemsCount = INITIAL_CHECKLIST.filter(i => i.pilar === pilar).length; // 12
    const totalItems = pilarItemsCount * UNITS; // 204

    // User completes 1 item
    const pProgresso = (1 / totalItems) * 100; // 0.4901...

    console.log(`1 completed: ${Math.round(pProgresso)}%`);

    // User completes 2 items
    const pProgresso2 = (2 / totalItems) * 100; // 0.98...
    console.log(`2 completed: ${Math.round(pProgresso2)}%`);
}

testMath();
