import React from 'react';
import { Package, ShoppingCart, History, BarChart3, Receipt, Users, Truck } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { sellers } = useInventory();

  const navItems = [
    { id: 'products', label: 'Product Input', icon: Package },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck },
    { id: 'sales', label: 'Sales Entry', icon: Receipt },
    { id: 'due-collection', label: 'Due Collection', icon: ShoppingCart },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'tracking', label: 'Stock & Profit', icon: BarChart3 },
    { id: 'sellers', label: 'Sellers', icon: Users }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="ml-3 text-xl font-bold text-gray-900">InventoryPro</h1>
          </div>
          <div className="flex space-x-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <div key={id} className="relative group">
                <button
                  onClick={() => onNavigate(id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentPage === id || (id === 'sellers' && currentPage.startsWith('seller-'))
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
                
                {/* Sellers Dropdown */}
                {id === 'sellers' && sellers.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-48">
                    {sellers.map((seller) => (
                      <button
                        key={seller}
                        onClick={() => onNavigate(`seller-${seller}`)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                          currentPage === `seller-${seller}` ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        {seller}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}