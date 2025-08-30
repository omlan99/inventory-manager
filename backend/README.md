# Inventory Management Backend

Production-ready backend API for the Inventory Management System.

## Features

- **Product Management**: CRUD operations for products with stock tracking
- **Purchase Orders**: Create and manage purchase orders with delivery tracking
- **Sales Records**: Record sales with automatic stock updates
- **Due Collection**: Track and manage due amounts from sellers
- **Data Validation**: Comprehensive input validation and error handling
- **MongoDB Integration**: Persistent data storage with Mongoose ODM

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Purchase Orders
- `GET /api/orders/purchase` - Get all purchase orders
- `POST /api/orders/purchase` - Create purchase order
- `PUT /api/orders/purchase/:id/deliver` - Mark order as delivered

### Sales Records
- `GET /api/orders/sales` - Get all sales records
- `POST /api/orders/sales` - Create sales record
- `GET /api/orders/sellers` - Get all sellers
- `GET /api/orders/sellers/:name` - Get seller summary

### Due Collection
- `GET /api/dues` - Get all due entries
- `GET /api/dues/sellers/:name` - Get dues for specific seller
- `POST /api/dues` - Create new due entry
- `DELETE /api/dues/:id` - Mark due as paid

## Database Schema

### Product
- name, initialStock, deliveredQuantity, soldQuantity
- buyingPrice, sellingPrice
- Virtual fields: remainingQuantity, buyingCost, salesValue, profitLoss

### PurchaseOrder
- productId, productName, quantity, buyingPrice, totalCost
- status (pending/delivered), orderDate, deliveryDate

### SalesRecord
- sellerName, items[], totalSalesAmount, totalDueAmount, cashSaleAmount, date

### DueEntry
- sellerName, shopName, dueAmount, dateAdded

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Database connection issues
- Resource not found errors
- Duplicate entries
- Server errors

All errors return consistent JSON responses with appropriate HTTP status codes.