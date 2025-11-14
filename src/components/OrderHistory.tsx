import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { History, Calendar, Package, DollarSign, Truck, Loader2 } from 'lucide-react';

export default function OrderHistory() {
  const { purchaseOrders, loading, error } = useInventory();

  // Only show delivered orders
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'delivered');
  const sortedOrders = deliveredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalOrderedValue = deliveredOrders.reduce((sum, order) => sum + order.totalCost, 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <History className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm text-gray-600">Delivered Orders</div>
                <div className="text-2xl font-bold text-blue-600">{deliveredOrders.length}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Ordered Value</div>
                <div className="text-2xl font-bold text-green-600">${totalOrderedValue.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <p className="mt-2 text-gray-600">History of all delivered purchase orders</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="p-8">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading order history...</h3>
              <p className="text-gray-600">Please wait while we fetch your delivered orders.</p>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delivered orders yet</h3>
              <p className="text-gray-600">Delivered purchase orders will appear here!</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Date & Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Package className="h-4 w-4" />
                          <span>Product Name</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Truck className="h-4 w-4" />
                          <span>Delivered Quantity</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Buying Price per Unit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Total Ordered Value</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Delivery Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedOrders.map((order) => (
                      <tr key={order.id || order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.productName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {order.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.buyingPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ${order.totalCost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.deliveryDate || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">Total Ordered Value</h3>
                        <p className="text-sm text-green-600">Sum of all delivered orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-900">${totalOrderedValue.toFixed(2)}</div>
                      <div className="text-sm text-green-600">{deliveredOrders.length} delivered orders</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}