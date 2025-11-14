import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product, PurchaseOrder, SalesRecord, DueEntry, SellerSummary } from '../types';
import { productApi, purchaseOrderApi, salesApi, dueApi } from '../services/api';

interface InventoryState {
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  salesRecords: SalesRecord[];
  sellers: string[];
  dueEntries: DueEntry[];
  loading: boolean;
  error: string | null;
}

interface InventoryContextType extends InventoryState {
  // Product methods
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  
  // Purchase Order methods
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => Promise<void>;
  updatePurchaseOrderStatus: (id: string, status: 'delivered', deliveryDate?: string) => Promise<void>;
  
  // Sales methods
  addSalesRecord: (salesRecord: Omit<SalesRecord, 'id' | 'createdAt'>) => Promise<void>;
  addSeller: (sellerName: string) => void;
  getSellerSummary: (sellerName: string) => Promise<SellerSummary | null>;
  updateSalesRecord: (id: string, updates: Partial<SalesRecord>) => Promise<void>;
  
  // Due methods
  addDueEntry: (dueEntry: Omit<DueEntry, 'id' | 'createdAt'>) => Promise<void>;
  markDueAsPaid: (dueId: string) => Promise<void>;
  getSellerDues: (sellerName: string) => Promise<DueEntry[]>;
  getSellerTotalDue: (sellerName: string) => Promise<number>;
  
  // Utility methods
  getProduct: (id: string) => Product | undefined;
  getRemainingQuantity: (productId: string) => number;
  
  // Data loading methods
  loadProducts: () => Promise<void>;
  loadPurchaseOrders: () => Promise<void>;
  loadSalesRecords: () => Promise<void>;
  loadSellers: () => Promise<void>;
  loadDueEntries: () => Promise<void>;
  refreshData: () => Promise<void>;
}

type Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_PURCHASE_ORDERS'; payload: PurchaseOrder[] }
  | { type: 'SET_SALES_RECORDS'; payload: SalesRecord[] }
  | { type: 'SET_SELLERS'; payload: string[] }
  | { type: 'SET_DUE_ENTRIES'; payload: DueEntry[] }
  | { type: 'ADD_SELLER'; payload: string };

const initialState: InventoryState = {
  products: [],
  purchaseOrders: [],
  salesRecords: [],
  sellers: [],
  dueEntries: [],
  loading: false,
  error: null,
};

function inventoryReducer(state: InventoryState, action: Action): InventoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_PURCHASE_ORDERS':
      return { ...state, purchaseOrders: action.payload };
    case 'SET_SALES_RECORDS':
      return { ...state, salesRecords: action.payload };
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };
    case 'SET_DUE_ENTRIES':
      return { ...state, dueEntries: action.payload };
    case 'ADD_SELLER':
      return { 
        ...state, 
        sellers: state.sellers.includes(action.payload) 
          ? state.sellers 
          : [...state.sellers, action.payload] 
      };
    default:
      return state;
  }
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Error handling wrapper
  const handleApiCall = async (apiCall: () => Promise<any>, errorMessage: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      return await apiCall();
    } catch (error) {
      console.error(errorMessage, error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Data loading methods
  const loadProducts = async () => {
    await handleApiCall(async () => {
      const products = await productApi.getAll();
      dispatch({ type: 'SET_PRODUCTS', payload: products });
    }, 'Failed to load products');
  };

  const loadPurchaseOrders = async () => {
    await handleApiCall(async () => {
      const orders = await purchaseOrderApi.getAll();
      dispatch({ type: 'SET_PURCHASE_ORDERS', payload: orders });
    }, 'Failed to load purchase orders');
  };

  const loadSalesRecords = async () => {
    await handleApiCall(async () => {
      const records = await salesApi.getAll();
      dispatch({ type: 'SET_SALES_RECORDS', payload: records });
    }, 'Failed to load sales records');
  };

  const loadSellers = async () => {
    await handleApiCall(async () => {
      const sellers = await salesApi.getSellers();
      dispatch({ type: 'SET_SELLERS', payload: sellers });
    }, 'Failed to load sellers');
  };

  const loadDueEntries = async () => {
    await handleApiCall(async () => {
      const dues = await dueApi.getAll();
      dispatch({ type: 'SET_DUE_ENTRIES', payload: dues });
    }, 'Failed to load due entries');
  };

  const refreshData = async () => {
    await Promise.all([
      loadProducts(),
      loadPurchaseOrders(),
      loadSalesRecords(),
      loadSellers(),
      loadDueEntries(),
    ]);
  };

  // Product methods
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    await handleApiCall(async () => {
      await productApi.create(productData);
      await loadProducts();
    }, 'Failed to add product');
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await handleApiCall(async () => {
      await productApi.update(id, updates);
      await loadProducts();
    }, 'Failed to update product');
  };

  // Purchase Order methods
  const addPurchaseOrder = async (orderData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    await handleApiCall(async () => {
      await purchaseOrderApi.create({
        productId: orderData.productId,
        quantity: orderData.quantity,
        buyingPrice: orderData.buyingPrice,
      });
      await loadPurchaseOrders();
    }, 'Failed to add purchase order');
  };

  const updatePurchaseOrderStatus = async (id: string, status: 'delivered', deliveryDate?: string) => {
    await handleApiCall(async () => {
      await purchaseOrderApi.markDelivered(id);
      await Promise.all([loadPurchaseOrders(), loadProducts()]);
    }, 'Failed to update purchase order status');
  };

  // Sales methods
  const addSalesRecord = async (salesData: Omit<SalesRecord, 'id' | 'createdAt'>) => {
    await handleApiCall(async () => {
      await salesApi.create(salesData);
      await Promise.all([loadSalesRecords(), loadProducts(), loadSellers()]);
    }, 'Failed to add sales record');
  };

  const addSeller = (sellerName: string) => {
    if (sellerName.trim()) {
      dispatch({ type: 'ADD_SELLER', payload: sellerName.trim() });
    }
  };

  const getSellerSummary = async (sellerName: string): Promise<SellerSummary | null> => {
    try {
      return await salesApi.getSellerSummary(sellerName);
    } catch (error) {
      console.error('Failed to get seller summary:', error);
      return null;
    }
  };

  const updateSalesRecord = async (id: string, updates: Partial<SalesRecord>) => {
    await handleApiCall(async () => {
      // Note: This would need to be implemented in the backend
      // For now, we'll just refresh the data
      await loadSalesRecords();
    }, 'Failed to update sales record');
  };

  // Due methods
  const addDueEntry = async (dueData: Omit<DueEntry, 'id' | 'createdAt'>) => {
    await handleApiCall(async () => {
      await dueApi.create(dueData);
      await loadDueEntries();
    }, 'Failed to add due entry');
  };

  const markDueAsPaid = async (dueId: string) => {
    await handleApiCall(async () => {
      await dueApi.markPaid(dueId);
      await loadDueEntries();
    }, 'Failed to mark due as paid');
  };

  const getSellerDues = async (sellerName: string): Promise<DueEntry[]> => {
    try {
      const result = await dueApi.getBySeller(sellerName);
      return result.dueEntries || [];
    } catch (error) {
      console.error('Failed to get seller dues:', error);
      return [];
    }
  };

  const getSellerTotalDue = async (sellerName: string): Promise<number> => {
    try {
      const result = await dueApi.getBySeller(sellerName);
      return result.totalDue || 0;
    } catch (error) {
      console.error('Failed to get seller total due:', error);
      return 0;
    }
  };

  // Utility methods
  const getProduct = (id: string) => {
    return state.products.find(product => product.id === id || product._id === id);
  };

  const getRemainingQuantity = (productId: string): number => {
    const product = getProduct(productId);
    return product ? product.deliveredQuantity - product.soldQuantity : 0;
  };

  // Load initial data
  useEffect(() => {
    refreshData().catch(console.error);
  }, []);

  return (
    <InventoryContext.Provider value={{
      ...state,
      addProduct,
      updateProduct,
      addPurchaseOrder,
      updatePurchaseOrderStatus,
      addSalesRecord,
      addSeller,
      getSellerSummary,
      updateSalesRecord,
      addDueEntry,
      markDueAsPaid,
      getSellerDues,
      getSellerTotalDue,
      getProduct,
      getRemainingQuantity,
      loadProducts,
      loadPurchaseOrders,
      loadSalesRecords,
      loadSellers,
      loadDueEntries,
      refreshData,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}