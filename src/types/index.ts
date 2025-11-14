export interface Product {
  id?: string;
  _id?: string;
  name: string;
  initialStock: number;
  deliveredQuantity: number;
  soldQuantity: number;
  buyingPrice: number;
  sellingPrice: number;
  createdAt: string;
  // Virtual fields from backend
  remainingQuantity?: number;
  buyingCost?: number;
  salesValue?: number;
  profitLoss?: number;
}

export interface Order {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id?: string;
  _id?: string;
  productId: string;
  productName: string;
  quantity: number;
  buyingPrice: number;
  totalCost: number;
  status: 'pending' | 'delivered';
  orderDate: string;
  deliveryDate?: string;
  createdAt: string;
}

export interface SalesItem {
  id?: string;
  _id?: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
}

export interface SalesRecord {
  id?: string;
  _id?: string;
  sellerName: string;
  items: SalesItem[];
  totalSalesAmount: number;
  totalDueAmount: number;
  cashSaleAmount: number;
  date: string;
  createdAt: string;
}

export interface DueEntry {
  id?: string;
  _id?: string;
  sellerName: string;
  shopName: string;
  dueAmount: number;
  dateAdded: string;
  createdAt: string;
}

export interface SellerSummary {
  sellerName: string;
  totalSales: number;
  totalQuantitySold: number;
  salesRecords: SalesRecord[];
  productsSold: any[];
}