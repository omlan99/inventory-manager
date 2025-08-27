import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product, Order, SalesRecord, PurchaseOrder, DueEntry, SellerSummary } from '../types';

interface InventoryState {
  products: Product[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  salesRecords: SalesRecord[];
  sellers: string[];
  dueEntries: DueEntry[];
}

interface InventoryContextType extends InventoryState {
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrderStatus: (id: string, status: 'delivered', deliveryDate?: string) => void;
  addSalesRecord: (salesRecord: Omit<SalesRecord, 'id' | 'createdAt'>) => void;
  addSeller: (sellerName: string) => void;
  getProduct: (id: string) => Product | undefined;
  getSellerSummary: (sellerName: string) => SellerSummary | null;
  updateSalesRecord: (id: string, updates: Partial<SalesRecord>) => void;
  getRemainingQuantity: (productId: string) => number;
  addDueEntry: (dueEntry: Omit<DueEntry, 'id' | 'createdAt'>) => void;
  markDueAsPaid: (dueId: string) => void;
  getSellerDues: (sellerName: string) => DueEntry[];
  getSellerTotalDue: (sellerName: string) => number;
}

type Action = 
  | { type: 'SET_STATE'; payload: InventoryState }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: { id: string; updates: Partial<PurchaseOrder> } }
  | { type: 'ADD_SALES_RECORD'; payload: SalesRecord }
  | { type: 'ADD_SELLER'; payload: string }
  | { type: 'UPDATE_SALES_RECORD'; payload: { id: string; updates: Partial<SalesRecord> } }
  | { type: 'ADD_DUE_ENTRY'; payload: DueEntry }
  | { type: 'MARK_DUE_AS_PAID'; payload: string };

const initialState: InventoryState = {
  products: [],
  orders: [],
  purchaseOrders: [],
  salesRecords: [],
  sellers: [],
  dueEntries: []
};

function inventoryReducer(state: InventoryState, action: Action): InventoryState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id 
            ? { ...product, ...action.payload.updates }
            : product
        )
      };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: [...state.purchaseOrders, action.payload] };
    case 'UPDATE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map(order => 
          order.id === action.payload.id 
            ? { ...order, ...action.payload.updates }
            : order
        )
      };
    case 'ADD_SALES_RECORD':
      return { ...state, salesRecords: [...state.salesRecords, action.payload] };
    case 'ADD_SELLER':
      return { 
        ...state, 
        sellers: state.sellers.includes(action.payload) 
          ? state.sellers 
          : [...state.sellers, action.payload] 
      };
    case 'UPDATE_SALES_RECORD':
      return {
        ...state,
        salesRecords: state.salesRecords.map(record => 
          record.id === action.payload.id 
            ? { ...record, ...action.payload.updates }
            : record
        )
      };
    case 'ADD_DUE_ENTRY':
      return { ...state, dueEntries: [...state.dueEntries, action.payload] };
    case 'MARK_DUE_AS_PAID':
      return {
        ...state,
        dueEntries: state.dueEntries.filter(entry => entry.id !== action.payload)
      };
    default:
      return state;
  }
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('inventoryData');
    if (savedState) {
      dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventoryData', JSON.stringify(state));
  }, [state]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      deliveredQuantity: productData.initialStock,
      soldQuantity: 0,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_ORDER', payload: newOrder });
  };

  const addPurchaseOrder = (orderData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const newPurchaseOrder: PurchaseOrder = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: newPurchaseOrder });
  };

  const updatePurchaseOrderStatus = (id: string, status: 'delivered', deliveryDate?: string) => {
    const purchaseOrder = state.purchaseOrders.find(order => order.id === id);
    if (purchaseOrder && status === 'delivered') {
      // Add delivered quantity to product stock
      const product = state.products.find(p => p.id === purchaseOrder.productId);
      if (product) {
        updateProduct(purchaseOrder.productId, {
          deliveredQuantity: product.deliveredQuantity + purchaseOrder.quantity
        });
      }
      
      // Update purchase order status
      dispatch({ 
        type: 'UPDATE_PURCHASE_ORDER', 
        payload: { 
          id, 
          updates: { 
            status, 
            deliveryDate: deliveryDate || new Date().toISOString().split('T')[0] 
          } 
        } 
      });
    }
  };

  const addSalesRecord = (salesData: Omit<SalesRecord, 'id' | 'createdAt'>) => {
    const newSalesRecord: SalesRecord = {
      ...salesData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    // Update product sold quantity for each item
    salesData.items.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      if (product) {
        updateProduct(item.productId, {
          soldQuantity: product.soldQuantity + item.quantity
        });
      }
    });
    
    dispatch({ type: 'ADD_SALES_RECORD', payload: newSalesRecord });
  };

  const addSeller = (sellerName: string) => {
    if (sellerName.trim()) {
      dispatch({ type: 'ADD_SELLER', payload: sellerName.trim() });
    }
  };

  const getProduct = (id: string) => {
    return state.products.find(product => product.id === id);
  };

  const getSellerSummary = (sellerName: string): SellerSummary | null => {
    const sellerRecords = state.salesRecords.filter(record => record.sellerName === sellerName);
    
    if (sellerRecords.length === 0) return null;

    const totalSales = sellerRecords.reduce((sum, record) => sum + record.totalSalesAmount, 0);
    const totalQuantitySold = sellerRecords.reduce((sum, record) => 
      sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Group products sold by this seller
    const productMap = new Map();
    sellerRecords.forEach(record => {
      record.items.forEach(item => {
        if (productMap.has(item.productId)) {
          const existing = productMap.get(item.productId);
          existing.totalQuantity += item.quantity;
          existing.totalValue += item.totalPrice;
        } else {
          productMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: item.quantity,
            totalValue: item.totalPrice
          });
        }
      });
    });

    const productsSold = Array.from(productMap.values()).map(product => ({
      ...product,
      averagePrice: product.totalValue / product.totalQuantity
    }));

    return {
      sellerName,
      totalSales,
      totalQuantitySold,
      salesRecords: sellerRecords,
      productsSold
    };
  };

  const updateSalesRecord = (id: string, updates: Partial<SalesRecord>) => {
    dispatch({ type: 'UPDATE_SALES_RECORD', payload: { id, updates } });
  };

  const getRemainingQuantity = (productId: string): number => {
    const product = state.products.find(p => p.id === productId);
    return product ? product.deliveredQuantity - product.soldQuantity : 0;
  };

  const addDueEntry = (dueData: Omit<DueEntry, 'id' | 'createdAt'>) => {
    const newDueEntry: DueEntry = {
      ...dueData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_DUE_ENTRY', payload: newDueEntry });
  };

  const markDueAsPaid = (dueId: string) => {
    dispatch({ type: 'MARK_DUE_AS_PAID', payload: dueId });
  };

  const getSellerDues = (sellerName: string): DueEntry[] => {
    return state.dueEntries.filter(entry => entry.sellerName === sellerName);
  };

  const getSellerTotalDue = (sellerName: string): number => {
    return state.dueEntries
      .filter(entry => entry.sellerName === sellerName)
      .reduce((total, entry) => total + entry.dueAmount, 0);
  };

  return (
    <InventoryContext.Provider value={{
      ...state,
      addProduct,
      updateProduct,
      addOrder,
      addPurchaseOrder,
      updatePurchaseOrderStatus,
      addSalesRecord,
      addSeller,
      getProduct,
      getSellerSummary,
      updateSalesRecord,
      getRemainingQuantity,
      addDueEntry,
      markDueAsPaid,
      getSellerDues,
      getSellerTotalDue
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