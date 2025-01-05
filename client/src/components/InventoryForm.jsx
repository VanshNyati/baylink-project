import React, { useState, useEffect } from 'react';

const InventoryForm = ({ onSubmit, initialData = null, onCancel }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        itemCode: '',
        category: '',
        totalUnits: '',
        purchasePrice: '',
        gstRate: '',
        isInclusive: false,
        stockUnit: 'Unit',
        lowStockWarning: false,
        lowStockQuantity: '',
        images: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [errors, setErrors] = useState({}); // State to hold validation errors

    useEffect(() => {
        if (initialData) {
            setFormData({
                itemName: initialData.itemName || '',
                itemCode: initialData.itemCode || '',
                category: initialData.category || '',
                totalUnits: initialData.totalUnits || '',
                purchasePrice: initialData.purchasePrice || '',
                gstRate: initialData.gstRate || '',
                isInclusive: initialData.isInclusive || false,
                stockUnit: initialData.stockUnit || 'Unit',
                lowStockWarning: initialData.lowStockWarning || false,
                lowStockQuantity: initialData.lowStockQuantity || '',
                images: initialData.images || [],
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({
            ...prev,
            images: files, // Store the actual file objects
        }));
        const imagePreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(imagePreviews);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.itemName) newErrors.itemName = 'Item Name is required.';
        if (!formData.category) newErrors.category = 'Category is required.';
        if (formData.purchasePrice <= 0) newErrors.purchasePrice = 'Purchase Price must be a positive number.';
        if (formData.totalUnits < 0) newErrors.totalUnits = 'Total Units must be a non-negative number.';
        if (formData.lowStockWarning && formData.lowStockQuantity <= 0) {
            newErrors.lowStockQuantity = 'Low Stock Warning Quantity must be a positive number.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // Validate before submission

        const formDataToSend = new FormData();
        formDataToSend.append('itemName', formData.itemName);
        formDataToSend.append('itemCode', formData.itemCode);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('totalUnits', Number(formData.totalUnits)); // Convert to number
        formDataToSend.append('purchasePrice', Number(formData.purchasePrice)); // Convert to number
        formDataToSend.append('gstRate', Number(formData.gstRate)); // Convert to number
        formDataToSend.append('isInclusive', formData.isInclusive);
        formDataToSend.append('stockUnit', formData.stockUnit);
        formDataToSend.append('lowStockWarning', formData.lowStockWarning);
        formDataToSend.append('lowStockQuantity', Number(formData.lowStockQuantity)); // Convert to number

        // Append each image file to the FormData
        formData.images.forEach((file) => {
            formDataToSend.append('images', file);
        });

        console.log('Form Data:', Array.from(formDataToSend.entries()));
        await onSubmit(formDataToSend);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-screen" encType="multipart/form-data">
            <h2 className="text-lg font-bold">{initialData ? 'Edit Item' : 'Create Item'}</h2>
            <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">General Details</h3>
                <div>
                    <label className="block font-medium mb-1">Upload Item Images</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                        className="block w-full border rounded p-2"
                    />
                    <div className="flex mt-2">
                        {imagePreviews.map((src, index) => (
                            <img key={index} src={src} alt={`Preview ${index}`} className="w-20 h-20 object-cover mr-2" />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block font-medium mb-1">Item Name *</label>
                    <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        required
                        className="block w-full border rounded p-2"
                    />
                    {errors.itemName && <p className="text-red-500">{errors.itemName}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">Category *</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="block w-full border rounded p-2"
                    />
                    {errors.category && <p className="text-red-500">{errors.category}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">Item Code</label>
                    <input
                        type="text"
                        name="itemCode"
                        value={formData.itemCode}
                        onChange={handleChange}
                        className="block w-full border rounded p-2"
                    />
                </div>
            </div>

            <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Stock Details</h3>
                <div>
                    <label className="block font-medium mb-1">Unit</label>
                    <select
                        name="stockUnit"
                        value={formData.stockUnit}
                        onChange={handleChange}
                        className="block w-full border rounded p-2"
                    >
                        <option value="Unit">Unit</option>
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Total Units</label>
                    <input
                        type="number"
                        name="totalUnits"
                        value={formData.totalUnits}
                        onChange={handleChange}
                        className="block w-full border rounded p-2"
                    />
                    {errors.totalUnits && <p className="text-red-500">{errors.totalUnits}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">Enable Low Stock Warning</label>
                    <input
                        type="checkbox"
                        name="lowStockWarning"
                        checked={formData.lowStockWarning}
                        onChange={handleChange}
                    />
                </div>
                {formData.lowStockWarning && (
                    <div>
                        <label className="block font-medium mb-1">Low Stock Warning Quantity</label>
                        <input
                            type="number"
                            name="lowStockQuantity"
                            value={formData.lowStockQuantity}
                            onChange={handleChange}
                            className="block w-full border rounded p-2"
                        />
                        {errors.lowStockQuantity && <p className="text-red-500">{errors.lowStockQuantity}</p>}
                    </div>
                )}
            </div>

            <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">Pricing Details</h3>
                <div>
                    <label className="block font-medium mb-1">Purchase Price *</label>
                    <input
                        type="number"
                        name="purchasePrice"
                        value={formData.purchasePrice}
                        onChange={handleChange}
                        required
                        className="block w-full border rounded p-2"
                    />
                    {errors.purchasePrice && <p className="text-red-500">{errors.purchasePrice}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">GST Rate (%)</label>
                    <input
                        type="number"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleChange}
                        className="block w-full border rounded p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Price Inclusive of GST</label>
                    <input
                        type="checkbox"
                        name="isInclusive"
                        checked={formData.isInclusive}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    {initialData ? 'Update Item' : 'Add Item'}
                </button>
            </div>
        </form>
    );
};

export default InventoryForm;