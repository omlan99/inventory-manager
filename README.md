# Inventory Management System

A comprehensive inventory management system built with React, TypeScript, and Node.js with MongoDB backend.

## Features

- **Product Management**: Add, edit, and track products with stock levels
- **Purchase Orders**: Create and manage purchase orders with delivery tracking
- **Sales Entry**: Record sales with multiple products and seller tracking
- **Due Collection**: Manage outstanding amounts from sellers
- **Stock & Profit Tracking**: Real-time inventory and profit analysis
- **Seller Management**: Individual seller pages with performance metrics

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- CORS enabled for frontend integration
- Input validation with express-validator

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/inventory_management
PORT=5000
NODE_ENV=development
```

5. Start the backend server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```env
# For development
REACT_APP_API_URL=http://localhost:5000/api

# For production, change to your deployed backend URL:
# REACT_APP_API_URL=https://your-backend-domain.com/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Configuration

The frontend uses the `REACT_APP_API_URL` environment variable to connect to the backend. This makes the application deployment-ready:

- **Development**: `REACT_APP_API_URL=http://localhost:5000/api`
- **Production**: `REACT_APP_API_URL=https://your-backend-domain.com/api`

## API Endpoints

### Products
- `GET /api/products` - Get all products
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
- `POST /api/dues` - Create new due entry
- `DELETE /api/dues/:id` - Mark due as paid

## Deployment

### Backend Deployment
1. Deploy to your preferred platform (Heroku, DigitalOcean, AWS, etc.)
2. Set environment variables on your hosting platform
3. Ensure MongoDB is accessible from your hosting platform

### Frontend Deployment
1. Update `REACT_APP_API_URL` in your environment to point to your deployed backend
2. Build the application: `npm run build`
3. Deploy the `dist` folder to your hosting platform (Netlify, Vercel, etc.)

## Key Features

- **Real-time Data**: All data is fetched from and updated via backend APIs
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Loading indicators for better user experience
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works on desktop and mobile devices
- **Production Ready**: Environment-based configuration for easy deployment

## Development

The application is structured with:
- `src/services/api.ts` - All API communication methods
- `src/context/InventoryContext.tsx` - Global state management with API integration
- `src/components/` - React components for different pages
- `src/types/` - TypeScript type definitions
- `backend/` - Complete Node.js/Express backend with MongoDB

All localStorage usage has been replaced with proper API calls, making the application truly full-stack and deployment-ready.