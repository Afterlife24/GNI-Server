// on host at present







// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(bodyParser.json());

// // POST /details — Save user email and package type (just log to console)
// app.post('/details', async (req, res) => {
//     const { email, package: packageType } = req.body;

//     if (!email || !packageType) {
//         return res.status(400).json({ error: 'Email and package type are required.' });
//     }

//     try {
//         const newEntry = {
//             email,
//             packageType,
//             createdAt: new Date()
//         };
//         console.log('✅ Received details (not saved to DB):', newEntry);
//         res.status(200).json({ message: 'Details received (not saved to DB, just logged).', data: newEntry });
//     } catch (error) {
//         console.error('❌ Error processing request:', error);
//         res.status(500).json({ error: 'Failed to process details.' });
//     }
// });

// // GET /details — Return a mock response since we're not using a database
// app.get('/details', async (req, res) => {
//     try {
//         console.log('ℹ️ GET /details called - no data stored in DB');
//         res.status(200).json({ message: 'No database connection - this endpoint would normally return waitlist entries.' });
//     } catch (error) {
//         console.error('❌ Error in GET /details:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });

// module.exports = app;



























// -----------------------------------------------------------------------------------------------------------------


















// --------------------------------------------------------------------------------------------------------------------------

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const app = express();
const savedOTPS = {};

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://yourfrontenddomain.com',
            'https://yourfrontenddomain.com',
            'https://0a60-2409-40f0-5041-a94c-4441-3cb2-e9aa-3502.ngrok-free.app',
            'http://localhost:3000'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
const uri = "mongodb+srv://Dhanush2002:Dhanush2002@cluster0.ool5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let db;

async function connectToMongo() {
    try {
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        await client.connect();
        db = client.db('Dhanush2002');
        console.log('✅ Connected to MongoDB');

        // const PORT = 5000;
        // app.listen(PORT, () => {
        //     console.log(`🚀 Server running on http://localhost:${PORT}`);
        // });
    } catch (err) {
        console.error('❌ Error connecting to MongoDB:', err);
        setTimeout(connectToMongo, 3000);
    }
}
connectToMongo();

// ✅ Check if email already exists
app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    try {
        const collection = db.collection('packageSubmissions');
        const existingUser = await collection.findOne({ email });
        return res.status(200).json({
            exists: !!existingUser,
            message: existingUser ? 'Email already subscribed.' : 'Email not found.'
        });
    } catch (error) {
        console.error('❌ Error checking email:', error);
        return res.status(500).json({ error: 'Failed to check email.' });
    }
});

// ✅ Contact form submission
app.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required.' });

    try {
        if (!db) return res.status(503).json({ error: 'Database not connected.' });
        const collection = db.collection('contact_details');
        const result = await collection.insertOne({ name, email, message, createdAt: new Date() });
        console.log('✅ Contact saved:', result.insertedId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('❌ Error inserting contact:', error);
        res.status(500).json({ error: 'Failed to submit contact form.' });
    }
});

// ✅ Get all contact submissions
app.get('/contact', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'Database not connected' });
        const entries = await db.collection('contact_details').find().sort({ createdAt: -1 }).toArray();
        res.status(200).json(entries);
    } catch (error) {
        console.error('❌ Error fetching contacts:', error);
        res.status(500).json({ error: 'Server error while fetching contacts' });
    }
});

// ✅ Package details + confirmation email
app.post('/details', async (req, res) => {
    const { email, package: packageType } = req.body;
    if (!email || !packageType) return res.status(400).json({ error: 'Email and package type are required.' });

    try {
        const transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true,
            auth: {
                user: "contact@gniapp.com",
                pass: "@Riosrogers99."
            }
        });

        const mailOptions = {
            from: 'contact@gniapp.com',
            to: email,
            subject: 'Your Package Confirmation',
            text: `Hi there,\n\nYou have selected the "${packageType}" package.\n\nThank you for your interest!\n\n- Your Company Name`
        };

        await transporter.sendMail(mailOptions);

        const collection = db.collection('packageSubmissions');
        const newEntry = { email, packageType, createdAt: new Date() };
        await collection.insertOne(newEntry);

        console.log('✅ Confirmation sent & details saved:', newEntry);
        res.status(200).json({ message: 'Email sent and details saved.', data: newEntry });
    } catch (error) {
        console.error('❌ Error processing details:', error);
        res.status(500).json({ error: 'Failed to process your request.' });
    }
});

// ✅ Get all package submissions
app.get('/details', async (req, res) => {
    try {
        const entries = await db.collection('packageSubmissions').find().sort({ createdAt: -1 }).toArray();
        res.status(200).json(entries);
    } catch (error) {
        console.error('❌ Error in GET /details:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ✅ Send OTP via email
app.post('/sendotp', (req, res) => {
    const email = req.body.email;
    const otp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');

    const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 465,
        secure: true,
        auth: {
            user: "contact@gniapp.com",
            pass: "@Riosrogers99."
        }
    });

    const mailOptions = {
        from: 'contact@gniapp.com',
        to: email,
        subject: "Email Verification Code",
        html: `
            <p>Dear User,</p>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This code will expire in 60 seconds.</p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`❌ Error sending OTP: ${error}`);
            return res.status(500).send("Couldn't send OTP");
        }

        savedOTPS[email] = otp;
        setTimeout(() => delete savedOTPS[email], 60000);
        console.log(`✅ OTP sent to ${email}: ${otp}`);
        res.send("Sent OTP");
    });
});

// ✅ Verify OTP
app.post('/verify', (req, res) => {
    const { email, otp } = req.body;
    if (savedOTPS[email] === otp) {
        return res.send("Verified");
    } else {
        return res.status(400).send("Invalid OTP");
    }
});

module.exports = app;
