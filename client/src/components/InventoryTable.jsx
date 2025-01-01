import React from 'react';

const InventoryTable = ({ items, onEdit, onDelete, onEditQuantity }) => {
    return (
        <table className="min-w-full border-collapse border border-gray-200">
            <thead>
                <tr>
                    <th className="border border-gray-200 p-2">Item Name</th>
                    <th className="border border-gray-200 p-2">Item Code</th>
                    <th className="border border-gray-200 p-2">Category</th>
                    <th className="border border-gray-200 p-2">Stock Quantity</th>
                    <th className="border border-gray-200 p-2">Stock Value</th>
                    <th className="border border-gray-200 p-2">Purchase Price</th>
                    <th className="border border-gray-200 p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <tr key={item._id}>
                        <td className="border border-gray-200 p-2">{item.itemName}</td>
                        <td className="border border-gray-200 p-2">{item.itemCode}</td>
                        <td className="border border-gray-200 p-2">{item.category}</td>
                        <td className="border border-gray-200 p-2">
                            {item.totalUnits}
                            {item.totalUnits < item.lowStockQuantity && (
                                <span className="text-red-500 ml-2" title="Low Stock Warning">⚠️</span>
                            )}
                        </td>
                        <td className="border border-gray-200 p-2">₹{item.totalPrice}</td>
                        <td className="border border-gray-200 p-2">₹{item.purchasePrice}</td>
                        <td className="border border-gray-200 p-2">
                            <button onClick={() => onEdit(item)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                            <button onClick={() => onEditQuantity(item)} className="bg-green-500 text-white px-2 py-1 rounded ml-2">Edit Quantity</button>
                            <button onClick={() => onDelete(item._id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default InventoryTable;