const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const AWS = require('aws-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const Busboy = require('busboy');


dotenv.config();
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadToS3 = async (buffer, fileName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ACL: 'public-read',
    };
    return s3.upload(params).promise();
};

router.post('/', (req, res) => {
    const busboy = new Busboy({ headers: req.headers });
    const fileBuffers = [];
    const fileNames = [];
    const fields = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const bufferArray = [];
        file.on('data', (data) => bufferArray.push(data));
        file.on('end', () => {
            fileBuffers.push(Buffer.concat(bufferArray));
            fileNames.push(filename);
        });
    });

    busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
    });

    busboy.on('finish', async () => {
        try {
            const uploadPromises = fileBuffers.map((buffer, index) =>
                uploadToS3(buffer, `${Date.now()}_${fileNames[index]}`)
            );
            const s3Responses = await Promise.all(uploadPromises);
            const imageUrls = s3Responses.map((resp) => resp.Location);

            const newItem = new Item({
                ...fields,
                images: imageUrls,
            });

            const savedItem = await newItem.save();
            res.status(201).json(savedItem);
        } catch (err) {
            console.error('Error uploading files:', err);
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
