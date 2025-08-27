import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Package } from 'lucide-react';

export default function ProductInput() {
  const { addProduct } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    initialStock: '',
    buyingPrice: '',
    sellingPrice: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.initialStock || !formData.buyingPrice || !formData.sellingPrice) {
      alert('Please fill in all fields');
      return;
    }

    addProduct({
      name: formData.name,
      initialStock: parseInt(formData.initialStock),
      buyingPrice: parseFloat(formData.buyingPrice),
      sellingPrice: parseFloat(formData.sellingPrice)
    });

    setFormData({
      name: '',
      initialStock: '',
      buyingPrice: '',
      sellingPrice: ''
    });

    alert('Product added successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          </div>
          <p className="mt-2 text-gray-600">Enter product details to add to inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter product name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="initialStock" className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Stock
              </label>
              <input
                type="number"
                id="initialStock"
                name="initialStock"
                value={formData.initialStock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Quantity"
              />
            </div>

            <div>
              <label htmlFor="buyingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                Buying Price ($)
              </label>
              <input
                type="number"
                id="buyingPrice"
                name="buyingPrice"
                value={formData.buyingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                Selling Price ($)
              </label>
              <input
                type="number"
                id="sellingPrice"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </form>
      </div>
    </div>
  );
}