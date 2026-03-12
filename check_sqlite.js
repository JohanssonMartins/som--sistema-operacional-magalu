
import sqlite3 from 'better-sqlite3';
const db = new sqlite3('dev.db');

try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tabelas no SQLite:', tables.map(t => t.name).join(', '));

    for (const table of tables) {
        if (table.name === 'sqlite_sequence' || table.name.startsWith('_')) continue;
        const count = db.prepare(`SELECT count(*) as count FROM "${table.name}"`).get();
        console.log(`Tabela ${table.name}: ${count.count} registros`);
    }
} catch (e) {
    console.error(e);
} finally {
    db.close();
}
