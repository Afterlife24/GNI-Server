// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const app = express();
// // const PORT = 5000;

// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection URI
// const uri = "mongodb+srv://Dhanush6371:Dhanush2002@cluster0.kozns.mongodb.net/Dhanush6371?retryWrites=true&w=majority";

// // Connect to MongoDB
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Define a schema
// const waitlistSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   packageType: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// // Create a model
// const Waitlist = mongoose.model('Waitlist', waitlistSchema);

// // POST /details endpoint
// app.post('/details', async (req, res) => {
//   const { email, package: packageType } = req.body;

//   if (!email || !packageType) {
//     return res.status(400).json({ error: 'Email and package type are required.' });
//   }

//   try {
//     // Save to MongoDB
//     const newEntry = new Waitlist({ email, packageType });
//     await newEntry.save();

//     console.log('✅ Details saved to MongoDB:', { email, packageType });

//     res.status(200).json({ message: 'Details received and saved successfully.' });
//   } catch (error) {
//     console.error('❌ Error saving to MongoDB:', error);
//     res.status(500).json({ error: 'Failed to save details.' });
//   }
// });


// // GET /details endpoint to fetch all waitlist entries
// app.get('/details', async (req, res) => {
//   try {
//     const waitlistEntries = await Waitlist.find().sort({ createdAt: -1 });
//     res.status(200).json(waitlistEntries);
//   } catch (error) {
//     console.error('❌ Error fetching data from MongoDB:', error);
//     res.status(500).json({ error: 'Failed to fetch details.' });
//   }
// });


// // Start the server
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });










































const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
let db;
let client;

const uri = "mongodb+srv://Dhanush6371:Dhanush2002@cluster0.kozns.mongodb.net/Dhanush6371?retryWrites=true&w=majority";

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
async function connectToMongo() {
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        db = client.db('Dhanush2002');
        console.log('✅ Connected to MongoDB');
        startServer(); // Start server after successful DB connection
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err);
        setTimeout(connectToMongo, 3000); // Retry after 3 seconds
    }
}

// POST /details — Save user email and package type
app.post('/details', async (req, res) => {
    const { email, package: packageType } = req.body;

    if (!email || !packageType) {
        return res.status(400).json({ error: 'Email and package type are required.' });
    }

    try {
        const collection = db.collection('waitlist');
        const newEntry = {
            email,
            packageType,
            createdAt: new Date()
        };
        await collection.insertOne(newEntry);
        console.log('✅ Details saved to MongoDB:', newEntry);
        res.status(200).json({ message: 'Details received and saved successfully.' });
    } catch (error) {
        console.error('❌ Error saving to MongoDB:', error);
        res.status(500).json({ error: 'Failed to save details.' });
    }
});

// GET /details — Retrieve all waitlist entries
app.get('/details', async (req, res) => {
    try {
        const collection = db.collection('waitlist');
        const entries = await collection.find().sort({ createdAt: -1 }).toArray();
        res.status(200).json(entries);
    } catch (error) {
        console.error('❌ Error fetching data from MongoDB:', error);
        res.status(500).json({ error: 'Failed to fetch details.' });
    }
});

// Start the server
function startServer() {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Initialize connection
connectToMongo();

module.exports = app;
