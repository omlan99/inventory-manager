export interface Product {
  id: string;
  name: string;
  initialStock: number;
  deliveredQuantity: number;
  soldQuantity: number;
  buyingPrice: number;
  sellingPrice: number;
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  productId: string;
  quantity: number;
  buyingPrice: number;
  supplierName: string;
  status: 'pending' | 'delivered';
  deliveryDate?: string;
  createdAt: string;
}

export interface SalesItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
}

export interface SalesRecord {
  id: string;
  sellerName: string;
  items: SalesItem[];
  totalSalesAmount: number;
  dueAmount: number;
  cashSaleAmount: number;
  saleDate: string;
  createdAt: string;
}

export interface DueEntry {
  id: string;
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