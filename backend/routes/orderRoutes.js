import express from 'express';
import { body, validationResult } from 'express-validator';
import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesRecord from '../models/SalesRecord.js';
import Product from '../models/Product.js';

const router = express.Router();

// Purchase Order validation
const validatePurchaseOrder = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('buyingPrice').isFloat({ min: 0 }).withMessage('Buying price must be non-negative')
];

// Sales Record validation
const validateSalesRecord = [
  body('sellerName').trim().notEmpty().withMessage('Seller name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('totalSalesAmount').isFloat({ min: 0 }).withMessage('Total sales amount must be non-negative'),
  body('date').notEmpty().withMessage('Sale date is required')
];

// GET /api/orders/purchase - Get all purchase orders
router.get('/purchase', async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find().populate('productId').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/purchase - Create purchase order
router.post('/purchase', validatePurchaseOrder, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, quantity, buyingPrice } = req.body;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const totalCost = quantity * buyingPrice;
    
    const purchaseOrder = await PurchaseOrder.create({
      productId,
      productName: product.name,
      quantity,
      buyingPrice,
      totalCost,
      orderDate: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/purchase/:id/deliver - Mark purchase order as delivered
router.put('/purchase/:id/deliver', async (req, res, next) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchaseOrder.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order already delivered'
      });
    }

    // Update purchase order status
    purchaseOrder.status = 'delivered';
    purchaseOrder.deliveryDate = new Date().toISOString().split('T')[0];
    await purchaseOrder.save();

    // Update product delivered quantity
    await Product.findByIdAndUpdate(
      purchaseOrder.productId,
      { $inc: { deliveredQuantity: purchaseOrder.quantity } }
    );

    res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/sales - Get all sales records
router.get('/sales', async (req, res, next) => {
  try {
    const { seller } = req.query;
    const filter = seller ? { sellerName: seller } : {};
    
    const salesRecords = await SalesRecord.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: salesRecords.length,
      data: salesRecords
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders/sales - Create sales record
router.post('/sales', validateSalesRecord, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sellerName, items, totalSalesAmount, totalDueAmount, date } = req.body;
    const cashSaleAmount = totalSalesAmount - (totalDueAmount || 0);

    // Validate stock availability for each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productName}`
        });
      }

      const availableStock = product.deliveredQuantity - product.soldQuantity;
      if (item.quantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
        });
      }
    }

    // Create sales record
    const salesRecord = await SalesRecord.create({
      sellerName,
      items,
      totalSalesAmount,
      totalDueAmount: totalDueAmount || 0,
      cashSaleAmount,
      date
    });

    // Update product sold quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { soldQuantity: item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      data: salesRecord
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/sellers - Get all sellers
router.get('/sellers', async (req, res, next) => {
  try {
    const sellers = await SalesRecord.distinct('sellerName');
    res.status(200).json({
      success: true,
      data: sellers
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/sellers/:name - Get seller summary
router.get('/sellers/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const salesRecords = await SalesRecord.find({ sellerName: name }).sort({ createdAt: -1 });
    
    if (salesRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sales records found for this seller'
      });
    }

    const totalSales = salesRecords.reduce((sum, record) => sum + record.totalSalesAmount, 0);
    const totalQuantitySold = salesRecords.reduce((sum, record) => 
      sum + record.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    res.status(200).json({
      success: true,
      data: {
        sellerName: name,
        totalSales,
        totalQuantitySold,
        salesRecords
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;