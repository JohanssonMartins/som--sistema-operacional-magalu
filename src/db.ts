import Dexie, { type EntityTable } from 'dexie';
import { User, ChecklistItem, INITIAL_CHECKLIST, MOCK_USERS } from './data';

// Declare Database
const db = new Dexie('SomDatabase') as Dexie & {
    users: EntityTable<User, 'id'>,
    baseItems: EntityTable<ChecklistItem, 'id'>, // Template checklist items
    items: EntityTable<ChecklistItem, 'id'> // Generated checklist items per unit
};

// Schema declaration
db.version(1).stores({
    users: 'id, email, unidade, role',
    baseItems: 'id, pilar, bloco', // order is not primary key
    items: 'id, unidade, pilar, assigneeId, completed' // Index columns to allow filtering
});

// Seed data function to populate initial db if empty
db.on('populate', async () => {
    await db.users.bulkAdd(MOCK_USERS);
    await db.baseItems.bulkAdd(INITIAL_CHECKLIST);

    const units = Array.from(new Set(MOCK_USERS.map(u => u.unidade))).filter(u => u !== 'Master');
    const initialGeneratedItems = units.flatMap(unit =>
        INITIAL_CHECKLIST.map(item => ({ ...item, id: `${unit}-${item.id}`, unidade: unit, assigneeId: '' }))
    );
    await db.items.bulkAdd(initialGeneratedItems);
});

export { db };
