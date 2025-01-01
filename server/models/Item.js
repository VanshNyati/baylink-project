const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
        },
        itemCode: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        totalUnits: {
            type: Number,
            required: true,
            default: 0,
        },
        purchasePrice: {
            type: Number,
            required: true,
        },
        gstRate: {
            type: Number,
            default: 0,
        },
        isInclusive: {
            type: Boolean,
            default: false,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
        lowStockWarning: {
            type: Boolean,
            default: false,
        },
        lowStockQuantity: {
            type: Number,
            default: 0,
        },
        images: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

itemSchema.pre('save', function (next) {
    const item = this;
    const gstMultiplier = item.isInclusive ? 1 : 1 + item.gstRate / 100;
    item.totalPrice = item.totalUnits * item.purchasePrice * gstMultiplier;
    next();
});

module.exports = mongoose.model('Item', itemSchema);