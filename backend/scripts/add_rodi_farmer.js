import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Database file is in backend/data/storage.db
// This script is in backend/scripts/
const dbPath = path.join(__dirname, '../data/storage.db');

console.log(`Connecting to database at ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        process.exit(1);
    }
});

const farmerData = {
    name: 'Rodi Kremastos',
    description: "Rodi Kremastos is a family-run farm located in Kremastos, Evia, dedicated to organic pomegranate cultivation. Since 2012, we have been cultivating 'Wonderful' and 'Acco' varieties with care and respect for nature. In 2022, we received our organic certification from TUV AUSTRIA HELLAS, ensuring our products are 100% natural and free from pesticides. From our field directly to your table, we offer pure pomegranate juice, traditional liqueurs, and handmade care products.",
    address: 'Kremastos, Evia, Greece',
    latitude: 38.5156,
    longitude: 24.0300,
    category: 'Fruits',
    rawMaterial: 'Pomegranates', // Corrected field to rawMaterial
    producerName: 'Nikolas Retsas', // Corrected variable usage
    website: 'https://rodi-kremastos.gr/',
    phone: '',
    image: null,
    featured_farmer_image: null,
    story_points: JSON.stringify({
        point1: {
            title: 'Our Roots',
            content: 'Established in 2012 in Kremastos, Evia, with the planting of 30 acres of pomegranate trees.',
            date: 'Est. 2012'
        },
        point2: {
            title: 'Our Mission',
            content: 'Our cultivation is free of pesticides and sprays. We are committed to organic farming practices that respect nature and your health.'
        },
        point3: {
            title: 'Certified Organic',
            content: 'TUV AUSTRIA HELLAS\nSince 2022\n100% Natural'
        },
        point4: {
            title: 'Varieties',
            content: 'Cultivating Wonderful & Acco varieties, known for their unique taste.',
            date: 'Harvest Season'
        },
        point5: {
            title: 'Our Products',
            content: 'Producing 100% natural pomegranate juice, traditional liqueurs, petimezi, and handmade beeswax ointments.'
        }
    })
};

const sql = `
INSERT INTO storages (
    name, description, address, latitude, longitude, 
    category, rawMaterial, producer_name, website, phone,
    story_points, created_at, updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`;

db.run(sql, [
    farmerData.name,
    farmerData.description,
    farmerData.address,
    farmerData.latitude,
    farmerData.longitude,
    farmerData.category,
    farmerData.rawMaterial,
    farmerData.producerName,
    farmerData.website,
    farmerData.phone,
    farmerData.story_points
], function (err) {
    if (err) {
        console.error('Error inserting farmer:', err.message);
        process.exit(1);
    }
    console.log(`✅ A new farmer record has been inserted with ID ${this.lastID}`);
    console.log(`   Name: ${farmerData.name}`);
    console.log(`   Location: ${farmerData.address}`);
    // Close db connection
    db.close((closeErr) => {
        if (closeErr) {
            console.error('Error closing database', closeErr);
            process.exit(1);
        }
        process.exit(0);
    });
});
