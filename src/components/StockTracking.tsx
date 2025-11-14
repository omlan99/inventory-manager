import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { BarChart3, Package, TrendingUp, TrendingDown, DollarSign, Truck, Loader2 } from 'lucide-react';

export default function StockTracking() {
  const { products, purchaseOrders, salesRecords, loading, error } = useInventory();

  const getProductAnalysis = () => {
    return products.map(product => {
      // Calculate remaining quantity (Delivered - Sold)
      const remainingQuantity = product.deliveredQuantity - product.soldQuantity;
      
      // Calculate costs and values
      const buyingCost = product.deliveredQuantity * product.buyingPrice;
      const salesValue = product.soldQuantity * product.sellingPrice;
      const profit = (product.sellingPrice - product.buyingPrice) * product.soldQuantity;

      return {
        productId: product.id || product._id,
        productName: product.name,
        initialStock: product.initialStock,
        deliveredQuantity: product.deliveredQuantity,
        soldQuantity: product.soldQuantity,
        remainingQuantity,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        buyingCost,
        salesValue,
        profit
      };
    });
  };

  const productAnalysis = getProductAnalysis();
  const totalBuyingCost = productAnalysis.reduce((sum, item) => sum + item.buyingCost, 0);
  const totalSalesValue = productAnalysis.reduce((sum, item) => sum + item.salesValue, 0);
  const totalProfit = productAnalysis.reduce((sum, item) => sum + item.profit, 0);
  const totalRemainingStock = productAnalysis.reduce((sum, item) => sum + item.remainingQuantity, 0);

  const getStockStatus = (remainingQuantity: number, soldQuantity: number) => {
    if (remainingQuantity === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (remainingQuantity < soldQuantity * 0.2) return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Stock & Profit Tracking</h2>
          </div>
          <p className="mt-2 text-gray-600">Complete inventory flow from purchase orders to sales</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="p-8 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Products</p>
                  <p className="text-3xl font-bold text-blue-900">{products.length}</p>
                </div>
                <Package className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Remaining Stock</p>
                  <p className="text-3xl font-bold text-purple-900">{totalRemainingStock}</p>
                </div>
                <Truck className="h-10 w-10 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Buying Cost</p>
                  <p className="text-3xl font-bold text-orange-900">${totalBuyingCost.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-10 w-10 text-orange-600" />
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Sales Value</p>
                  <p className="text-3xl font-bold text-green-900">${totalSalesValue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${totalProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net Profit
                  </p>
                  <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    ${totalProfit.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className={`h-10 w-10 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Table */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading inventory data...</h3>
              <p className="text-gray-600">Please wait while we fetch your products and stock information.</p>
            </div>
          ) : productAnalysis.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">Add products to start tracking inventory and profits!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Stock Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Initial Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Delivered Qty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sold Qty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Remaining Qty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Buying Cost
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sales Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Profit/Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productAnalysis.map((item) => {
                      const stockStatus = getStockStatus(item.remainingQuantity, item.soldQuantity);
                      return (
                        <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                              {stockStatus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.initialStock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {item.deliveredQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {item.soldQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.remainingQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.remainingQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.buyingCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${item.salesValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                            <span className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              ${item.profit.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}