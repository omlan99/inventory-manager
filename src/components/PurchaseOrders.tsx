import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Truck, Plus, Package, Calendar, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function PurchaseOrders() {
  const { products, purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus, loading, error } = useInventory();
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    buyingPrice: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.buyingPrice) {
      alert('Please fill in all fields');
      return;
    }

    const product = products.find(p => (p.id || p._id) === formData.productId);
    if (!product) {
      alert('Product not found');
      return;
    }

    try {
      setIsSubmitting(true);
      const quantity = parseInt(formData.quantity);
      const buyingPrice = parseFloat(formData.buyingPrice);

      await addPurchaseOrder({
        productId: formData.productId,
        productName: product.name,
        quantity,
        buyingPrice,
        totalCost: quantity * buyingPrice,
        status: 'pending',
        orderDate: new Date().toISOString().split('T')[0]
      });

      setFormData({
        productId: '',
        quantity: '',
        buyingPrice: ''
      });

      alert('Purchase order created successfully!');
    } catch (error) {
      alert('Failed to create purchase order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      await updatePurchaseOrderStatus(orderId, 'delivered');
      alert('Order marked as delivered and stock updated!');
    } catch (error) {
      alert('Failed to mark order as delivered. Please try again.');
    }
  };

  const pendingOrders = purchaseOrders.filter(order => order.status === 'pending');
  const deliveredOrders = purchaseOrders.filter(order => order.status === 'delivered');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Purchase Orders</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage product orders and stock deliveries</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Create Purchase Order Form */}
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Purchase Order</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="product" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Product
                </label>
                <select
                  id="product"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product.id || product._id} value={product.id || product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Order
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label htmlFor="buyingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Buying Price ($)
                </label>
                <input
                  type="number"
                  id="buyingPrice"
                  value={formData.buyingPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: e.target.value }))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            {formData.quantity && formData.buyingPrice && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-semibold">Total Order Cost:</span>
                  <span className="text-2xl font-bold text-blue-800">
                    ${(parseInt(formData.quantity || '0') * parseFloat(formData.buyingPrice || '0')).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.productId || !formData.quantity || !formData.buyingPrice || isSubmitting || loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Order...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Create Purchase Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pending Orders */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pending Orders ({pendingOrders.length})</h3>
          </div>
          
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No pending orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingOrders.map((order) => (
                    <tr key={order.id || order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.buyingPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${order.totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleMarkAsDelivered(order.id || order._id!)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Mark Delivered</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delivered Orders */}
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Delivered Orders ({deliveredOrders.length})</h3>
          </div>
          
          {deliveredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No delivered orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buying Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveredOrders.map((order) => (
                    <tr key={order.id || order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.orderDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.deliveryDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {order.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.buyingPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">${order.totalCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}