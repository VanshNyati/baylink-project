import React, { useState } from 'react';

const QuantityModal = ({ item, onClose, onUpdate }) => {
    const [quantity, setQuantity] = useState(0);
    const [operation, setOperation] = useState('increase'); // Default to increase

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(operation, quantity);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Edit Quantity for {item.itemName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Choose Operation:</label>
                        <select
                            value={operation}
                            onChange={(e) => setOperation(e.target.value)}
                            className="block w-full border rounded p-2"
                        >
                            <option value="increase">Increase</option>
                            <option value="decrease">Decrease</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="block w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Update Quantity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuantityModal;