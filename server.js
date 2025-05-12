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

var nm = require('nodemailer');
let savedOTPS = {};

// const corsOptions = {
//     origin: ['https://dev-scanme.gofastapi.com', 'https://dev-client.gofastapi.com'], // Replace with actual frontends
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };

app.use(cors());
app.use(bodyParser.json());

let db;
let client;

const uri = "mongodb+srv://Dhanush2002:Dhanush2002@cluster0.ool5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
async function connectToMongo() {
    try {
        client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        await client.connect();
        db = client.db('Dhanush2002'); // Replace 'Dhanush6371' with your database name
        console.log('Connected to MongoDB');
        startServer(); // Start the server only after MongoDB connection is successful
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        setTimeout(connectToMongo, 3000); // Retry connection after 5 seconds
    }
}

// Helper function to get database
const getDatabase = async () => {
    if (!db) {
        await connectToMongo();
    }
    return db;
};

//Delayed server start
// function startServer() {
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//         console.log(`Server is running on http://localhost:${PORT}`);
//     });
// }

// Endpoint to send the order
app.post("/sendOrder", async (req, res) => {
    try {
        const db = await getDatabase();
        const tableNumber = String(req.query.table_num || req.body.tableNumber).trim();
        const { dishes, tokenId, email } = req.body;
        console.log("dishes",dishes);
        if (!tableNumber || isNaN(tableNumber)) {
            return res.status(400).json({ error: "A valid table number is required" });
        }


        const dishNames = dishes.map(dish => dish.name).join(', ');

        
        const newOrder = {
            tableNumber,
            dishes,
            createdAt: new Date(),
            isDelivered: false,
            tokenId,
            email,
        };
        console.log("**********")
        console.log("email",email);
        console.log("**********")
        var options = {
    from: 'youremail@gmail.com',
    to: email, // Use email from req.body
    subject: "Order Confirmation",
    html: `
        <h1>Order Confirmation</h1>
        <p>Dear Customer,</p>
        <p>Thank you for your order! We are pleased to confirm that your order has been received and is being processed. Here are the details of your order:</p>
        <p><strong>Items Ordered:</strong> ${dishNames}</p>
        <p>We hope you enjoy your meal! If you have any questions or need further assistance, please don't hesitate to contact us.</p>
        <p>Warm regards,</p>
        <p><strong>Le Kashmir</strong></p>
        <img src='cid:food' alt='Order Confirmation' width='1000px'>
    `,
    attachments: [
        {
            filename: 'food.jpeg',
            path: "https://cdn.prod.website-files.com/605826c62e8de87de744596e/62fb492b87daf525c8b50dc7_Aug%2015%20Order%20Confirmation%20page%20best%20practices%20(%26%20great%20examples).jpg",
            cid: 'food'
        }
    ]
};

        console.log("3");
        // Send the email
        transporter.sendMail(options, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        const result = await db.collection('orders').insertOne(newOrder);
        res.status(200).json({ message: "Order received successfully", tokenId, orderId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Endpoint to mark an order as delivered
app.post("/markAsDelivered", async (req, res) => {
    try {
        const db = await getDatabase();
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const result = await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { isDelivered: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order marked as delivered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});


app.post("/reserveTable", async (req, res) => {
    try {
        console.log("1");
        const db = await getDatabase();
        const { name, phone, date, time, persons, email } = req.body;

        const reservation = {
            name,
            phone,
            date,
            time,
            persons,
            email,
            createdAt: new Date(),
        };

        const result = await db.collection('reservations').insertOne(reservation);
        console.log("2");
        console.log(email);
        // Email configuration
        var options = {
    from: 'youremail@gmail.com',
    to: email, // Use email from req.body
    subject: "Table Reservation Confirmation",
    html: `
        <h1>Table Reservation Confirmation</h1>
        <p>Dear ${name},</p>
        <p>We are delighted to confirm your table reservation at our restaurant. Here are the details of your booking:</p>
        <ul>
            <li><strong>Date:</strong> ${date}</li>
            <li><strong>Time:</strong> ${time}</li>
        </ul>
        <p>We look forward to hosting you and ensuring you have a wonderful dining experience. If you have any special requests or need to make changes to your reservation, please feel free to contact us.</p>
        <p>Warm regards,</p>
        <p><strong>[Your Restaurant Name]</strong></p>
        <img src='cid:food' alt='Table Reserved' width='1000px'>
    `,
    attachments: [
        {
            filename: 'food.jpeg',
            path: "https://restaurant.eatapp.co/hubfs/reserved-1.webp",
            cid: 'food'
        }
    ]
};

        console.log("3");
        // Send the email
        transporter.sendMail(options, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        console.log("4");
        res.status(200).json({ message: "Reservation saved successfully", id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Get orders from the database
app.get("/getOrders", async (req, res) => {
    try {
        const db = await getDatabase();
        const orders = await db.collection('orders').find({}).toArray();
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Get reservations from the database
app.get("/getReservations", async (req, res) => {
    try {
        const db = await getDatabase();
        const reservations = await db.collection('reservations').find({}).toArray();
        res.status(200).json({ reservations });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Server-Sent Events route for orders
app.get('/streamOrders', async (req, res) => {
    try {
        const db = await getDatabase();
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendEvent = (change) => {
            res.write(`data: ${JSON.stringify(change)}\n\n`);
        };

        const ordersChangeStream = db.collection('orders').watch();
        ordersChangeStream.on('change', sendEvent);

        req.on('close', () => {
            ordersChangeStream.removeAllListeners('change');
        });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});

// Server-Sent Events route for reservations
app.get('/streamReservations', async (req, res) => {
    try {
        const db = await getDatabase();
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sendEvent = (change) => {
            res.write(`data: ${JSON.stringify(change)}\n\n`);
        };

        const reservationsChangeStream = db.collection('reservations').watch();
        reservationsChangeStream.on('change', sendEvent);

        req.on('close', () => {
            reservationsChangeStream.removeAllListeners('change');
        });
    } catch (error) {
        res.status(500).json({ error: "Error: " + error.message });
    }
});


var transporter = nm.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'scanme684@gmail.com',
        pass: 'zvngultpfogdtbxj'
    }
});

app.post('/sendotp', (req, res) => {
    console.log("Check point 1");
    let email = req.body.email;
    let digits = '0123456789';
    let limit = 4;
    let otp = '';

    for (let i = 0; i < limit; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    console.log("Check point 2");
    var options = {
    from: 'yourmail@gmail.com',
    to: `${email}`,
    subject: "Email Verification Code",
    html: `
        <p>Dear User,</p>
        <p>We hope this message finds you well. Please use the One-Time Password (OTP) below to verify your email address:</p>
        <p><strong>${otp}</strong></p>
        <p>If you did not request this verification, please ignore this email or contact our support team for assistance.</p>
        <p>Thank you for choosing our service.</p>
        <p>Best regards,</p>
        <p><strong>Le Kashmir</strong></p>
    `
};


    console.log("Check point 3");
    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
            return res.status(500).send("Couldn't send OTP"); // Use `return` to ensure no further response is sent.
        }

        savedOTPS[email] = otp;

        // Automatically delete OTP after 60 seconds
        setTimeout(() => {
            delete savedOTPS[email];
        }, 60000);

        console.log("OTP sent successfully");
        res.send("Sent OTP");
    });
    console.log("Check point 4");
});

app.post('/verify', (req, res) => {
    let otpReceived = req.body.otp;
    let email = req.body.email;

    if (savedOTPS[email] === otpReceived) {
        return res.send("Verified"); // Use `return` to ensure no further response is sent.
    } else {
        return res.status(500).send("Invalid OTP"); // Use `return` to ensure no further response is sent.
    }
});




// Initialize MongoDB connection
connectToMongo();



module.exports = app;














