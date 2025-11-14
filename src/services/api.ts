const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  count?: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Product API
export const productApi = {
  // Get all products
  getAll: async () => {
    const response = await apiRequest<ApiResponse<any[]>>('/products');
    return response.data || [];
  },

  // Get single product
  getById: async (id: string) => {
    const response = await apiRequest<ApiResponse<any>>(`/products/${id}`);
    return response.data;
  },

  // Create product
  create: async (productData: {
    name: string;
    initialStock: number;
    buyingPrice: number;
    sellingPrice: number;
  }) => {
    const response = await apiRequest<ApiResponse<any>>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data;
  },

  // Update product
  update: async (id: string, updates: any) => {
    const response = await apiRequest<ApiResponse<any>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  // Delete product
  delete: async (id: string) => {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Purchase Order API
export const purchaseOrderApi = {
  // Get all purchase orders
  getAll: async () => {
    const response = await apiRequest<ApiResponse<any[]>>('/orders/purchase');
    return response.data || [];
  },

  // Create purchase order
  create: async (orderData: {
    productId: string;
    quantity: number;
    buyingPrice: number;
  }) => {
    const response = await apiRequest<ApiResponse<any>>('/orders/purchase', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  },

  // Mark order as delivered
  markDelivered: async (orderId: string) => {
    const response = await apiRequest<ApiResponse<any>>(`/orders/purchase/${orderId}/deliver`, {
      method: 'PUT',
    });
    return response.data;
  },
};

// Sales API
export const salesApi = {
  // Get all sales records
  getAll: async (seller?: string) => {
    const query = seller ? `?seller=${encodeURIComponent(seller)}` : '';
    const response = await apiRequest<ApiResponse<any[]>>(`/orders/sales${query}`);
    return response.data || [];
  },

  // Create sales record
  create: async (salesData: {
    sellerName: string;
    items: any[];
    totalSalesAmount: number;
    totalDueAmount?: number;
    date: string;
  }) => {
    const response = await apiRequest<ApiResponse<any>>('/orders/sales', {
      method: 'POST',
      body: JSON.stringify(salesData),
    });
    return response.data;
  },

  // Get all sellers
  getSellers: async () => {
    const response = await apiRequest<ApiResponse<string[]>>('/orders/sellers');
    return response.data || [];
  },

  // Get seller summary
  getSellerSummary: async (sellerName: string) => {
    const response = await apiRequest<ApiResponse<any>>(`/orders/sellers/${encodeURIComponent(sellerName)}`);
    return response.data;
  },
};

// Due Collection API
export const dueApi = {
  // Get all dues
  getAll: async (seller?: string) => {
    const query = seller ? `?seller=${encodeURIComponent(seller)}` : '';
    const response = await apiRequest<ApiResponse<any[]>>(`/dues${query}`);
    return response.data || [];
  },

  // Get dues for specific seller
  getBySeller: async (sellerName: string) => {
    const response = await apiRequest<ApiResponse<any>>(`/dues/sellers/${encodeURIComponent(sellerName)}`);
    return response.data;
  },

  // Create due entry
  create: async (dueData: {
    sellerName: string;
    shopName: string;
    dueAmount: number;
    dateAdded: string;
  }) => {
    const response = await apiRequest<ApiResponse<any>>('/dues', {
      method: 'POST',
      body: JSON.stringify(dueData),
    });
    return response.data;
  },

  // Mark due as paid (delete)
  markPaid: async (dueId: string) => {
    await apiRequest(`/dues/${dueId}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await apiRequest<ApiResponse<any>>('/health');
    return response;
  },
};