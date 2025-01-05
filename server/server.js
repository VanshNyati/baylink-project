const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
dotenv.config();
console.log(process.env.MONGODB_URI);
connectDB();
const app = express();
app.use(bodyParser.json());
const corsOptions = {
    origin: ['https://baylink-project.vercel.app', 'http://localhost:3000'], // Use an array for multiple origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Referer',
    ],
    credentials: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).send('Welcome to Baylink API');
});
app.use('/api/items', require('./routes/itemRoutes')); 

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An internal server error occurred' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});