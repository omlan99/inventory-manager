import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { User, Calendar, Package, DollarSign, CreditCard as Edit3, Save, X, TrendingUp, Loader2 } from 'lucide-react';

interface SellerDetailsProps {
  sellerName: string;
}

export default function SellerDetails({ sellerName }: SellerDetailsProps) {
  const { getSellerSummary, updateSalesRecord } = useInventory();
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const sellerSummary = getSellerSummary(sellerName);

  if (!sellerSummary) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Seller not found</h3>
            <p className="text-gray-600">No sales records found for {sellerName}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter records by selected month
  const filteredRecords = sellerSummary.salesRecords.filter(record => {
    const recordMonth = record.date.slice(0, 7);
    return recordMonth === selectedMonth;
  });

  // Calculate monthly stats
  const monthlyStats = {
    totalSales: filteredRecords.reduce((sum, record) => sum + record.totalSalesAmount, 0),
    totalQuantity: filteredRecords.reduce((sum, record) => 
      sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    ),
    totalRecords: filteredRecords.length,
    totalDue: filteredRecords.reduce((sum, record) => sum + record.totalDueAmount, 0),
    totalCash: filteredRecords.reduce((sum, record) => sum + record.cashSaleAmount, 0)
  };

  // Group products sold in selected month
  const monthlyProducts = new Map();
  filteredRecords.forEach(record => {
    record.items.forEach(item => {
      if (monthlyProducts.has(item.productId)) {
        const existing = monthlyProducts.get(item.productId);
        existing.totalQuantity += item.quantity;
        existing.totalValue += item.totalPrice;
      } else {
        monthlyProducts.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: item.quantity,
          totalValue: item.totalPrice
        });
      }
    });
  });

  const monthlyProductsList = Array.from(monthlyProducts.values()).map(product => ({
    ...product,
    averagePrice: product.totalValue / product.totalQuantity
  }));

  const handleUpdateRecord = (recordId: string, newPrice: number, itemId: string) => {
    const record = filteredRecords.find(r => r.id === recordId);
    if (!record) return;

    const updatedItems = record.items.map(item => 
      item.id === itemId 
        ? { ...item, sellingPrice: newPrice, totalPrice: item.quantity * newPrice }
        : item
    );

    const newTotalSalesAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newCashSaleAmount = newTotalSalesAmount - record.totalDueAmount;

    updateSalesRecord(recordId, {
      items: updatedItems,
      totalSalesAmount: newTotalSalesAmount,
      cashSaleAmount: newCashSaleAmount
    });

    setEditingRecord(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{sellerName}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Summary - {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-600">Total Sales</p>
                <p className="text-2xl font-bold text-blue-900">${monthlyStats.totalSales.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <p className="text-sm font-medium text-green-600">Cash Sales</p>
                <p className="text-2xl font-bold text-green-900">${monthlyStats.totalCash.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-center">
                <p className="text-sm font-medium text-orange-600">Due Amount</p>
                <p className="text-2xl font-bold text-orange-900">${monthlyStats.totalDue.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-center">
                <p className="text-sm font-medium text-purple-600">Items Sold</p>
                <p className="text-2xl font-bold text-purple-900">{monthlyStats.totalQuantity}</p>
              </div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-center">
                <p className="text-sm font-medium text-indigo-600">Sales Records</p>
                <p className="text-2xl font-bold text-indigo-900">{monthlyStats.totalRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Sold This Month */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Products Sold This Month</h3>
          {monthlyProductsList.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No products sold in selected month</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyProductsList.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.totalQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.averagePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${product.totalValue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sales Records */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Records</h3>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No sales records for selected month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{record.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">${record.totalSalesAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRecord(editingRecord === record.id ? null : record.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {editingRecord === record.id ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {record.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {editingRecord === record.id ? (
                                <input
                                  type="number"
                                  defaultValue={item.sellingPrice}
                                  min="0"
                                  step="0.01"
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                  onBlur={(e) => handleUpdateRecord(record.id, parseFloat(e.target.value), item.id)}
                                />
                              ) : (
                                `$${item.sellingPrice.toFixed(2)}`
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-green-600">
                              ${item.totalPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <span className="text-gray-600">Cash Sale:</span>
                      <span className="ml-2 font-semibold text-green-600">${record.cashSaleAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600">Due Amount:</span>
                      <span className="ml-2 font-semibold text-orange-600">${record.totalDueAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-semibold text-blue-600">${record.totalSalesAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}