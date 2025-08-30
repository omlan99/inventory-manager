import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('initialStock').isInt({ min: 0 }).withMessage('Initial stock must be a non-negative integer'),
  body('buyingPrice').isFloat({ min: 0 }).withMessage('Buying price must be a non-negative number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number')
];

// GET /api/products - Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create new product
router.post('/', validateProduct, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, initialStock, buyingPrice, sellingPrice } = req.body;
    
    const product = await Product.create({
      name,
      initialStock,
      deliveredQuantity: initialStock, // Initially, delivered quantity equals initial stock
      buyingPrice,
      sellingPrice
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', validateProduct, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;