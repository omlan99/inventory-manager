import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Receipt, Plus, Trash2, CreditCard as Edit3, Save, X, Loader2 } from 'lucide-react';
import { SalesItem } from '../types';

export default function SalesEntry() {
  const { products, sellers, addSalesRecord, addSeller, loading, error, getRemainingQuantity } = useInventory();
  const [salesDate, setSalesDate] = useState(new Date().toISOString().split('T')[0]);
  const [sellerName, setSellerName] = useState('');
  const [showSellerSuggestions, setShowSellerSuggestions] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [salesItems, setSalesItems] = useState<SalesItem[]>([]);
  const [totalDueAmount, setTotalDueAmount] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sellerInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const filteredSellers = sellers.filter(seller =>
    seller.toLowerCase().includes(sellerName.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    getRemainingQuantity(product.id || product._id!) > 0
  );

  const handleSellerSelect = (seller: string) => {
    setSellerName(seller);
    setShowSellerSuggestions(false);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setSellingPrice(product.sellingPrice.toString());
    setShowProductSuggestions(false);
  };

  const addItemToSales = () => {
    if (!selectedProduct || !quantity || !sellingPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(sellingPrice);
    const total = qty * price;

    const availableStock = getRemainingQuantity(selectedProduct.id || selectedProduct._id!);
    if (qty > availableStock) {
      alert(`Not enough stock. Available: ${availableStock}`);
      return;
    }

    const newItem: SalesItem = {
      id: `temp-${Date.now()}`,
      productId: selectedProduct.id || selectedProduct._id!,
      productName: selectedProduct.name,
      quantity: qty,
      sellingPrice: price,
      totalPrice: total
    };

    setSalesItems([...salesItems, newItem]);
    
    // Reset form
    setSelectedProduct(null);
    setProductSearch('');
    setQuantity('');
    setSellingPrice('');
  };

  const removeItem = (itemId: string) => {
    setSalesItems(salesItems.filter(item => item.id !== itemId));
  };

  const startEditItem = (item: SalesItem) => {
    setEditingItem(item.id);
  };

  const saveEditItem = (itemId: string, updates: Partial<SalesItem>) => {
    setSalesItems(salesItems.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            ...updates,
            totalPrice: (updates.quantity || item.quantity) * (updates.sellingPrice || item.sellingPrice)
          }
        : item
    ));
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const totalSalesAmount = salesItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const dueAmount = parseFloat(totalDueAmount) || 0;
  const cashSaleAmount = totalSalesAmount - dueAmount;

  const handleSubmitSales = async () => {
    if (!sellerName.trim()) {
      alert('Please enter seller name');
      return;
    }

    if (salesItems.length === 0) {
      alert('Please add at least one product to the sales');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Add seller to the list if new
      addSeller(sellerName);

      // Create sales record
      await addSalesRecord({
        date: salesDate,
        sellerName: sellerName.trim(),
        items: salesItems,
        totalSalesAmount,
        totalDueAmount: dueAmount,
        cashSaleAmount
      });

      // Reset form
      setSalesDate(new Date().toISOString().split('T')[0]);
      setSellerName('');
      setSalesItems([]);
      setTotalDueAmount('');
      
      alert('Sales record created successfully!');
    } catch (error) {
      alert('Failed to create sales record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sellerInputRef.current && !sellerInputRef.current.contains(event.target as Node)) {
        setShowSellerSuggestions(false);
      }
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sales Entry</h2>
          </div>
          <p className="mt-2 text-gray-600">Create comprehensive sales records with multiple products</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="p-8">
          {/* Sales Header Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="salesDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Sales Date
              </label>
              <input
                type="date"
                id="salesDate"
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative" ref={sellerInputRef}>
              <label htmlFor="sellerName" className="block text-sm font-semibold text-gray-700 mb-2">
                Seller Name
              </label>
              <input
                type="text"
                id="sellerName"
                value={sellerName}
                onChange={(e) => {
                  setSellerName(e.target.value);
                  setShowSellerSuggestions(true);
                }}
                onFocus={() => setShowSellerSuggestions(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter seller name"
              />
              {showSellerSuggestions && filteredSellers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredSellers.map((seller, index) => (
                    <button
                      key={index}
                      onClick={() => handleSellerSelect(seller)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                    >
                      {seller}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Entry Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Product to Sales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative" ref={productInputRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductSuggestions(true);
                    setSelectedProduct(null);
                  }}
                  onFocus={() => setShowProductSuggestions(true)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search product..."
                />
                {showProductSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id || product._id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">Stock: {getRemainingQuantity(product.id || product._id!)} | Price: ${product.sellingPrice}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={selectedProduct ? getRemainingQuantity(selectedProduct.id || selectedProduct._id!) : 999999}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Qty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="flex items-end col-span-2">
                <button
                  onClick={addItemToSales}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {quantity && sellingPrice && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-sm text-blue-700">
                  Total Price: <span className="font-semibold">${(parseInt(quantity || '0') * parseFloat(sellingPrice || '0')).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sales Items List */}
          {salesItems.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingItem === item.id ? (
                            <input
                              type="number"
                              defaultValue={item.quantity}
                              min="1"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              onBlur={(e) => saveEditItem(item.id, { quantity: parseInt(e.target.value) })}
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingItem === item.id ? (
                            <input
                              type="number"
                              defaultValue={item.sellingPrice}
                              min="0"
                              step="0.01"
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              onBlur={(e) => saveEditItem(item.id, { sellingPrice: parseFloat(e.target.value) })}
                            />
                          ) : (
                            `$${item.sellingPrice.toFixed(2)}`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ${item.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {editingItem === item.id ? (
                              <>
                                <button
                                  onClick={() => cancelEdit()}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditItem(item)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sales Summary */}
              <div className="mt-6 space-y-4">
                {/* Total Sales Amount */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-sm text-blue-600 font-medium">Total Sales Amount</div>
                    <div className="text-3xl font-bold text-blue-800">${totalSalesAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Due Amount Input */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2">Due Amount</label>
                      <input
                        type="number"
                        value={totalDueAmount}
                        onChange={(e) => setTotalDueAmount(e.target.value)}
                        min="0"
                        max={totalSalesAmount}
                        step="0.01"
                        className="w-40 px-3 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-orange-600 font-medium">Due Amount</div>
                      <div className="text-2xl font-bold text-orange-800">${dueAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Cash Sale Amount */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium">Cash Sale Amount</div>
                    <div className="text-3xl font-bold text-green-800">${cashSaleAmount.toFixed(2)}</div>
                    <div className="text-xs text-green-600 mt-1">
                      (Total Sales - Due Amount)
                    </div>
                  </div>
                </div>
              </div>

              {/* Legacy Summary - Remove this section */}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  onClick={handleSubmitSales}
                  disabled={isSubmitting || loading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Sales Record...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-5 w-5" />
                      <span>Complete Sales Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}