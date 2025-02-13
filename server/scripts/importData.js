const { MongoClient } = require('mongodb');
const { readFileSync } = require('fs');
const path = require('path');

const uri = `mongodb+srv://varanasipavankalyan07:pavankalyan@cluster0.b5twf.mongodb.net/`;
const client = new MongoClient(uri);

async function uploadData() {
    try {
        await client.connect();

        const database = client.db('project'); 
        const collection = database.collection('restaurantlist'); 

        // Corrected file path (go up one level from scripts/)
        const filePath = path.join(__dirname, '..', 'data', 'file5.json'); 
        const data = JSON.parse(readFileSync(filePath, 'utf8'));

        if (!Array.isArray(data)) {
            throw new Error("JSON data is not an array. Ensure file1.json contains an array of objects.");
        }

        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents were inserted.`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.close();
    }
}

uploadData();
