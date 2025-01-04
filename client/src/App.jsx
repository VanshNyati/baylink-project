import React, { useState, useEffect, useCallback } from 'react';
import InventoryForm from './components/InventoryForm';
import InventoryTable from './components/InventoryTable';
import Pagination from './components/Pagination';
import QuantityModal from './components/QuantityModal';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';

function App() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [isQuantityModalVisible, setIsQuantityModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemsPerPage = 5;

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`https://4wrvbpvz89.execute-api.ap-south-1.amazonaws.com/prod/api/items?page=${currentPage}&limit=${itemsPerPage}`, {
        method: 'GET',
        credentials: 'include', // Include credentials like cookies if needed
        mode: 'cors', // Ensure cross-origin mode is set
      });
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data.items);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error fetching items. Please try again later.');
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFormSubmit = async (formData) => {
    const url = editingItem
      ? `https://4wrvbpvz89.execute-api.ap-south-1.amazonaws.com/prod/api/items/update/${editingItem._id}`
      : `https://4wrvbpvz89.execute-api.ap-south-1.amazonaws.com/prod/api/items/create`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const updatedItem = await response.json();
      setItems((prevItems) => {
        if (editingItem) {
          return prevItems.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          );
        } else {
          return [updatedItem, ...prevItems];
        }
      });
      await fetchItems();
      setIsFormVisible(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };


  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch(`https://4wrvbpvz89.execute-api.ap-south-1.amazonaws.com/prod/api/items/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', 
          mode: 'cors', 
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        fetchItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
      }
    }
  };

  const handleFilterToggle = () => {
    setShowLowStock(prev => !prev);
  };

  const filteredItems = showLowStock
    ? items.filter(item => item.totalUnits < item.lowStockQuantity)
    : items;

  const handleQuantityEdit = (item) => {
    setSelectedItem(item);
    setIsQuantityModalVisible(true);
  };

  const updateQuantity = async (operation, quantity) => {
    if (!selectedItem) return;

    const updatedQuantity = operation === 'increase'
      ? selectedItem.totalUnits + quantity
      : selectedItem.totalUnits - quantity;

    try {
      const response = await fetch(`https://4wrvbpvz89.execute-api.ap-south-1.amazonaws.com/prod/api/items/${selectedItem._id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          totalUnits: updatedQuantity,
          // Recalculate total price based on updated quantity
          totalPrice: updatedQuantity * selectedItem.purchasePrice *
            (selectedItem.isInclusive ? 1 : (1 + selectedItem.gstRate / 100))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const updatedItem = await response.json();

      // Update items state immediately
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        )
      );

      // Refresh the items list to ensure consistency
      await fetchItems();
      setIsQuantityModalVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity. Please try again.');
    }
  };


  const exportToCSV = () => {
    return items.map(item => ({
      ItemName: item.itemName,
      ItemCode: item.itemCode,
      Category: item.category,
      StockQuantity: item.totalUnits,
      StockValue: item.totalPrice,
      PurchasePrice: item.purchasePrice,
    }));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory.xlsx");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div>
          <button
            onClick={handleFilterToggle}
            className={`bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 ${showLowStock ? 'bg-yellow-600' : ''}`}
          >
            {showLowStock ? 'Show All Items' : 'Show Low Stock Items'}
          </button>
          <button
            onClick={() => {
              setIsFormVisible(true);
              setEditingItem(null);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2"
          >
            + Add to Inventory
          </button>
          <CSVLink data={exportToCSV()} filename={"inventory.csv"}>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2">Export to CSV</button>
          </CSVLink>
          <button onClick={exportToExcel} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ml-2">Export to Excel</button>
        </div>
      </div>

      {isFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <button
              onClick={() => setIsFormVisible(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <InventoryForm onSubmit={handleFormSubmit} initialData={editingItem} onCancel={() => setIsFormVisible(false)} />
          </div>
        </div>
      )}

      <InventoryTable items={filteredItems} onEdit={handleEdit} onDelete={handleDelete} onEditQuantity={handleQuantityEdit} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {isQuantityModalVisible && (
        <QuantityModal
          item={selectedItem}
          onClose={() => setIsQuantityModalVisible(false)}
          onUpdate={updateQuantity}
        />
      )}
    </div>
  );
}

export default App;
