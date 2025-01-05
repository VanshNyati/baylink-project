const Item = require('../models/itemModel'); // Assuming there's a model defined for the items

exports.getItems = async (req, res) => {
    try {
        const items = await Item.find();
        console.log('Fetched Items:', items); // Log the fetched items
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createItem = async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        console.log('Created Item:', savedItem);
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(400).json({ message: 'Bad Request' });
    }
};

exports.updateItem = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log('Updated Item:', updatedItem);
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
        console.log('Deleted Item:', deletedItem);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
