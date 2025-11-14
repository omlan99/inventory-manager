import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { CreditCard, Plus, Check, DollarSign, Store, Loader2 } from 'lucide-react';

export default function DueCollection() {
  const { sellers, addDueEntry, markDueAsPaid, getSellerDues, getSellerTotalDue, loading, error } = useInventory();
  const [selectedSeller, setSelectedSeller] = useState('');
  const [shopName, setShopName] = useState('');
  const [dueAmount, setDueAmount] = useState('');
  const [sellerDues, setSellerDues] = useState<any[]>([]);
  const [sellerTotalDue, setSellerTotalDue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDues, setLoadingDues] = useState(false);

  // Load seller dues when seller is selected
  const handleSellerChange = async (seller: string) => {
    setSelectedSeller(seller);
    if (seller) {
      setLoadingDues(true);
      try {
        const [dues, totalDue] = await Promise.all([
          getSellerDues(seller),
          getSellerTotalDue(seller)
        ]);
        setSellerDues(dues);
        setSellerTotalDue(totalDue);
      } catch (error) {
        console.error('Failed to load seller dues:', error);
        setSellerDues([]);
        setSellerTotalDue(0);
      } finally {
        setLoadingDues(false);
      }
    } else {
      setSellerDues([]);
      setSellerTotalDue(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSeller || !shopName.trim() || !dueAmount) {
      alert('Please fill in all fields');
      return;
    }

    const amount = parseFloat(dueAmount);
    if (amount <= 0) {
      alert('Due amount must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDueEntry({
        sellerName: selectedSeller,
        shopName: shopName.trim(),
        dueAmount: amount,
        dateAdded: new Date().toISOString().split('T')[0]
      });

      setShopName('');
      setDueAmount('');
      
      // Refresh seller dues
      await handleSellerChange(selectedSeller);
      
      alert('Due entry added successfully!');
    } catch (error) {
      alert('Failed to add due entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (dueId: string, shopName: string, amount: number) => {
    if (confirm(`Mark due from ${shopName} ($${amount.toFixed(2)}) as paid?`)) {
      try {
        await markDueAsPaid(dueId);
        // Refresh seller dues
        await handleSellerChange(selectedSeller);
        alert('Due marked as paid successfully!');
      } catch (error) {
        alert('Failed to mark due as paid. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Due Collection</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage and track due amounts from sellers</p>
        </div>

        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Seller Selection */}
        <div className="p-8 border-b border-gray-200">
          <div className="mb-6">
            <label htmlFor="seller" className="block text-sm font-semibold text-gray-700 mb-2">
              Select Seller
            </label>
            <select
              id="seller"
              value={selectedSeller}
              onChange={(e) => handleSellerChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a seller...</option>
              {sellers.map(seller => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </select>
          </div>

          {/* Add Due Entry Form */}
          {selectedSeller && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Due Entry for {selectedSeller}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount ($)</label>
                    <input
                      type="number"
                      value={dueAmount}
                      onChange={(e) => setDueAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add Due Entry</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Due List */}
        {selectedSeller && (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Due List - {selectedSeller}</h3>
              <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Total Due:</span>
                  <span className="text-lg font-bold text-orange-800">${sellerTotalDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {loadingDues ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Loading dues...</p>
              </div>
            ) : sellerDues.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600">No due entries for this seller</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <Store className="h-4 w-4" />
                          <span>Shop Name</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>Due Amount</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sellerDues.map((due) => (
                      <tr key={due.id || due._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {due.shopName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {due.dateAdded}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                          ${due.dueAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleMarkAsPaid(due.id || due._id, due.shopName, due.dueAmount)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <Check className="h-3 w-3" />
                            <span>Paid</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}