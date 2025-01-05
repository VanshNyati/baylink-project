const express = require('express');
const Item = require('../models/Item');
const multer = require('multer');
const path = require('path');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1', // Change to your region
});

const s3 = new AWS.S3();
const router = express.Router();
const upload = multer(); // Use multer for handling multipart/form-data

// Function to upload image to S3
const uploadImageToS3 = (file) => {
    const params = {
        Bucket: 's3image-baylink', // Your bucket name
        Key: `images/${file.originalname}`, // File name you want to save as
        Body: file.buffer, // File buffer
        ContentType: file.mimetype, // File type
        ACL: 'public-read', // Set permissions
    };

    return s3.upload(params).promise();
};

// Set up multer for file uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Directory to save uploaded files
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
//     },
// });

// const upload = multer({ storage }); 

router.post('/', upload.array('images'), async (req, res) => { 
    try {
        if (!req.body.itemName || !req.body.category || !req.body.purchasePrice || !req.body.totalUnits) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const imageUrls = await Promise.all(req.files.map(uploadImageToS3));
        const newItem = new Item({
            itemName: req.body.itemName,
            itemCode: req.body.itemCode,
            category: req.body.category,
            description: req.body.description,
            totalUnits: req.body.totalUnits,
            purchasePrice: req.body.purchasePrice,
            gstRate: req.body.gstRate,
            isInclusive: req.body.isInclusive,
            totalPrice: req.body.totalPrice,
            lowStockWarning: req.body.lowStockWarning,
            lowStockQuantity: req.body.lowStockQuantity,
            images: imageUrls.map(url => url.Location),
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Get all items with pagination
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const total = await Item.countDocuments();
        const items = await Item.find().skip(skip).limit(limit);
        res.json({ items, total });
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update an item
router.put('/:id', upload.array('images'), async (req, res) => {
    const { id } = req.params;

    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // If totalUnits is being updated, recalculate totalPrice
        if (req.body.totalUnits !== undefined) {
            const gstMultiplier = item.isInclusive ? 1 : 1 + (item.gstRate / 100);
            req.body.totalPrice = req.body.totalUnits * item.purchasePrice * gstMultiplier;
        }

        const updatedItem = await Item.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Delete an item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedItem = await Item.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

// Update stock quantity
router.patch('/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { totalUnits } = req.body; // Assuming you send the new quantity in the request body

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, { totalUnits: totalUnits }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log('Updated Stock:', updatedItem);
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating stock quantity:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

module.exports = router;

