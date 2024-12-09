require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: 'https://khel-fron.vercel.app', // Allow requests from this frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies if necessary
}));
app.options('*', cors());

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events')
const protectedRoutes = require('./routes/protected');

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/api', eventRoutes);
// MongoDB Connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); 
    }
};

connectToDatabase();
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
