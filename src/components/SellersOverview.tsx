import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Users, TrendingUp, Package, DollarSign, Loader2 } from 'lucide-react';

interface SellersOverviewProps {
  onNavigateToSeller: (sellerName: string) => void;
}

export default function SellersOverview({ onNavigateToSeller }: SellersOverviewProps) {
  const { sellers, salesRecords, loading, error } = useInventory();

  const getSellerStats = (sellerName: string) => {
    const sellerRecords = salesRecords.filter(record => record.sellerName === sellerName);
    const totalSales = sellerRecords.reduce((sum, record) => sum + record.totalSalesAmount, 0);
    const totalQuantity = sellerRecords.reduce((sum, record) => 
      sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const totalRecords = sellerRecords.length;
    
    return { totalSales, totalQuantity, totalRecords };
  };

  const totalSystemSales = salesRecords.reduce((sum, record) => sum + record.totalSalesAmount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Sellers Overview</h2>
          </div>
          <p className="mt-2 text-gray-600">Manage and track all seller performance</p>
        </div>

       {error && (
         <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
           <p className="text-red-600 text-sm">{error}</p>
         </div>
       )}

        {/* Summary Cards */}
        <div className="p-8 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Sellers</p>
                  <p className="text-3xl font-bold text-blue-900">{sellers.length}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Sales</p>
                  <p className="text-3xl font-bold text-green-900">${totalSystemSales.toFixed(2)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Sales Records</p>
                  <p className="text-3xl font-bold text-purple-900">{salesRecords.length}</p>
                </div>
                <Package className="h-10 w-10 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sellers List */}
        <div className="p-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading sellers...</h3>
            <p className="text-gray-600">Please wait while we fetch seller information.</p>
          </div>
        ) : sellers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers yet</h3>
              <p className="text-gray-600">Sellers will appear here when you create sales entries!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller) => {
                const stats = getSellerStats(seller);
                return (
                  <div
                    key={seller}
                    onClick={() => onNavigateToSeller(seller)}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{seller}</h3>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Sales</span>
                        <span className="font-semibold text-green-600">${stats.totalSales.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Items Sold</span>
                        <span className="font-semibold text-blue-600">{stats.totalQuantity}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sales Records</span>
                        <span className="font-semibold text-purple-600">{stats.totalRecords}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}