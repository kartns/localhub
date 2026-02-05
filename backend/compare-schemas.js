// Temporary script to compare dev and prod database schemas
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const devDbPath = path.join(__dirname, 'data', 'storage.db');
const prodDbPath = path.join(__dirname, 'data', 'storage-prod.db');

const getColumns = (dbPath) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.all("PRAGMA table_info(storages)", (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows.map(r => r.name));
        });
    });
};

async function compare() {
    console.log('DEV Columns:');
    const devCols = await getColumns(devDbPath);
    devCols.forEach(c => console.log('  - ' + c));

    console.log('');
    console.log('PROD Columns:');
    const prodCols = await getColumns(prodDbPath);
    prodCols.forEach(c => console.log('  - ' + c));

    const missingInProd = devCols.filter(c => !prodCols.includes(c));
    const missingInDev = prodCols.filter(c => !devCols.includes(c));

    console.log('');
    console.log('MISSING IN PROD:');
    missingInProd.forEach(c => console.log('  - ' + c));
    if (missingInProd.length === 0) console.log('  (none)');

    console.log('');
    console.log('MISSING IN DEV:');
    missingInDev.forEach(c => console.log('  - ' + c));
    if (missingInDev.length === 0) console.log('  (none)');
}

compare().catch(console.error);
