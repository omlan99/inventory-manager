import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import Navigation from './components/Navigation';
import ProductInput from './components/ProductInput';
import PurchaseOrders from './components/PurchaseOrders';
import SalesEntry from './components/SalesEntry';
import DueCollection from './components/DueCollection';
import OrderHistory from './components/OrderHistory';
import StockTracking from './components/StockTracking';
import SellersOverview from './components/SellersOverview';
import SellerDetails from './components/SellerDetails';

function App() {
  const [currentPage, setCurrentPage] = useState('products');

  const renderCurrentPage = () => {
    // Handle seller-specific pages
    if (currentPage.startsWith('seller-')) {
      const sellerName = currentPage.replace('seller-', '');
      return <SellerDetails sellerName={sellerName} />;
    }

    switch (currentPage) {
      case 'products':
        return <ProductInput />;
      case 'purchase-orders':
        return <PurchaseOrders />;
      case 'sales':
        return <SalesEntry />;
      case 'due-collection':
        return <DueCollection />;
      case 'history':
        return <OrderHistory />;
      case 'tracking':
        return <StockTracking />;
      case 'sellers':
        return <SellersOverview onNavigateToSeller={(seller) => setCurrentPage(`seller-${seller}`)} />;
      default:
        return <ProductInput />;
    }
  };

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="py-8">
          {renderCurrentPage()}
        </main>
      </div>
    </InventoryProvider>
  );
}

export default App;