const Item = require('../models/Item');

exports.getItems = async (req, res) => {
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
};

exports.createItem = async (req, res) => {
    const { itemName, itemCode, category, totalUnits, purchasePrice, lowStockWarning, lowStockQuantity, gstRate, stockUnit } = req.body;

    // Process the uploaded files
    const imagePaths = req.files.map(file => file.path); // Get the paths of the uploaded images

    const newItem = new Item({
        itemName,
        itemCode,
        category,
        totalUnits,
        purchasePrice,
        gstRate,
        isInclusive: req.body.isInclusive === 'true',
        stockUnit,
        lowStockWarning,
        lowStockQuantity,
        images: imagePaths, // Save the paths in the database
    });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;
    const { purchasePrice, gstRate, isInclusive } = req.body;

    // Calculate the final purchase price based on GST inclusion
    const finalPurchasePrice = isInclusive === 'true'
        ? purchasePrice
        : purchasePrice + (purchasePrice * gstRate / 100);

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
};
exports.deleteItem = async (req, res) => {
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
};

exports.updateStockQuantity = async (req, res) => {
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
};