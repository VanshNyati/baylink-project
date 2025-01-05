const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (fileContent, fileName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName, 
        Body: fileContent,
        ACL: 'public-read', 
    };

    return s3.upload(params).promise();
};

router.post('/', async (req, res) => {
    const { itemName, itemCode, category, totalUnits, purchasePrice, gstRate, stockUnit, lowStockWarning, lowStockQuantity, isInclusive } = {};
    const imageUrls = [];
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        console.log(`Uploading: ${filename}`);

        // Upload each file to S3
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now()}_${filename}`,
            Body: file,
            ContentType: mimetype,
            ACL: 'public-read', // Make the file public
        };

        try {
            const s3Response = await s3.upload(params).promise();
            imageUrls.push(s3Response.Location);
        } catch (error) {
            console.error('Error uploading to S3:', error);
            return res.status(500).json({ message: 'Error uploading file to S3' });
        }
    });

    busboy.on('field', (fieldname, value) => {
        // Collect the form fields
        console.log(`Processed field: ${fieldname}`);
        if (fieldname === 'itemName') itemName = value;
        if (fieldname === 'itemCode') itemCode = value;
        if (fieldname === 'category') category = value;
        if (fieldname === 'totalUnits') totalUnits = parseInt(value, 10);
        if (fieldname === 'purchasePrice') purchasePrice = parseFloat(value);
        if (fieldname === 'gstRate') gstRate = parseFloat(value);
        if (fieldname === 'stockUnit') stockUnit = value;
        if (fieldname === 'lowStockWarning') lowStockWarning = value === 'true';
        if (fieldname === 'lowStockQuantity') lowStockQuantity = parseInt(value, 10);
        if (fieldname === 'isInclusive') isInclusive = value === 'true';
    });

    busboy.on('finish', async () => {
        try {
            // Final purchase price calculation
            const finalPurchasePrice = isInclusive
                ? purchasePrice
                : purchasePrice + (purchasePrice * gstRate) / 100;

            // Save the item to the database
            const newItem = new Item({
                itemName,
                itemCode,
                category,
                totalUnits,
                purchasePrice: finalPurchasePrice,
                gstRate,
                stockUnit,
                lowStockWarning,
                lowStockQuantity,
                isInclusive,
                images: imageUrls,
            });

            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        } catch (error) {
            console.error('Error saving item:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });

    req.pipe(busboy);
});

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

router.put('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

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
    const { quantity } = req.body;

    try {
        const updatedItem = await Item.findByIdAndUpdate(id, { totalUnits: quantity }, { new: true });
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
