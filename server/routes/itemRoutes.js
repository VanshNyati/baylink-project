const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Middleware for multer to handle file uploads
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    },
});

const upload = multer({ storage });

// Create a new item
router.post('/', upload.array('images'), async (req, res) => {
    const { itemName, itemCode, category, totalUnits, purchasePrice, lowStockWarning, lowStockQuantity, gstRate, stockUnit, isInclusive } = req.body;

    // Process the uploaded files
    const imagePaths = req.files.map(file => file.path); // Get the paths of the uploaded images

    const finalPurchasePrice = isInclusive === 'true'
        ? purchasePrice
        : purchasePrice + (purchasePrice * gstRate / 100);

    const newItem = new Item({
        itemName,
        itemCode,
        category,
        totalUnits,
        purchasePrice: finalPurchasePrice, // Use the calculated final purchase price
        gstRate,
        isInclusive: isInclusive === 'true',
        stockUnit,
        lowStockWarning,
        lowStockQuantity,
        images: imagePaths,
    });

    try {
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
router.put('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
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
    const { quantity } = req.body; // Assuming you send the new quantity in the request body

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, { totalUnits: quantity }, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating stock quantity:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
});

module.exports = router;

