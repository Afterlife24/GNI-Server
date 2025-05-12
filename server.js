
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// POST /details — Save user email and package type (just log to console)
app.post('/details', async (req, res) => {
    const { email, package: packageType } = req.body;

    if (!email || !packageType) {
        return res.status(400).json({ error: 'Email and package type are required.' });
    }

    try {
        const newEntry = {
            email,
            packageType,
            createdAt: new Date()
        };
        console.log('✅ Received details (not saved to DB):', newEntry);
        res.status(200).json({ message: 'Details received (not saved to DB, just logged).', data: newEntry });
    } catch (error) {
        console.error('❌ Error processing request:', error);
        res.status(500).json({ error: 'Failed to process details.' });
    }
});

// GET /details — Return a mock response since we're not using a database
app.get('/details', async (req, res) => {
    try {
        console.log('ℹ️ GET /details called - no data stored in DB');
        res.status(200).json({ message: 'No database connection - this endpoint would normally return waitlist entries.' });
    } catch (error) {
        console.error('❌ Error in GET /details:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

module.exports = app;









































// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { MongoClient, ObjectId } = require('mongodb');

// const app = express();
// let db;
// let client;

// const uri = "mongodb+srv://Dhanush6371:Dhanush2002@cluster0.kozns.mongodb.net/Dhanush6371?retryWrites=true&w=majority";

// // Middlewares
// app.use(cors());
// app.use(bodyParser.json());

// // Connect to MongoDB
// async function connectToMongo() {
//     try {
//         client = new MongoClient(uri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000,
//         });
//         await client.connect();
//         db = client.db('Dhanush2002');
//         console.log('✅ Connected to MongoDB');
//         startServer(); // Start server after successful DB connection
//     } catch (err) {
//         console.error('❌ Error connecting to MongoDB:', err);
//         setTimeout(connectToMongo, 3000); // Retry after 3 seconds
//     }
// }

// // POST /details — Save user email and package type
// app.post('/details', async (req, res) => {
//     const { email, package: packageType } = req.body;

//     if (!email || !packageType) {
//         return res.status(400).json({ error: 'Email and package type are required.' });
//     }

//     try {
//         const collection = db.collection('waitlist');
//         const newEntry = {
//             email,
//             packageType,
//             createdAt: new Date()
//         };
//         await collection.insertOne(newEntry);
//         console.log('✅ Details saved to MongoDB:', newEntry);
//         res.status(200).json({ message: 'Details received and saved successfully.' });
//     } catch (error) {
//         console.error('❌ Error saving to MongoDB:', error);
//         res.status(500).json({ error: 'Failed to save details.' });
//     }
// });

// // GET /details — Retrieve all waitlist entries
// app.get('/details', async (req, res) => {
//     try {
//         const collection = db.collection('waitlist');
//         const entries = await collection.find().sort({ createdAt: -1 }).toArray();
//         res.status(200).json(entries);
//     } catch (error) {
//         console.error('❌ Error fetching data from MongoDB:', error);
//         res.status(500).json({ error: 'Failed to fetch details.' });
//     }
// });

// function startServer() {
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on http://localhost:${PORT}`);
//     });
// }

// // Initialize connection
// connectToMongo();

// module.exports = app;
