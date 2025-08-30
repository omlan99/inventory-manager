import express from 'express';
import { body, validationResult } from 'express-validator';
import DueEntry from '../models/DueEntry.js';

const router = express.Router();

// Due Entry validation
const validateDueEntry = [
  body('sellerName').trim().notEmpty().withMessage('Seller name is required'),
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('dueAmount').isFloat({ min: 0.01 }).withMessage('Due amount must be greater than 0'),
  body('dateAdded').notEmpty().withMessage('Date added is required')
];

// GET /api/dues - Get all due entries
router.get('/', async (req, res, next) => {
  try {
    const { seller } = req.query;
    const filter = seller ? { sellerName: seller } : {};
    
    const dueEntries = await DueEntry.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: dueEntries.length,
      data: dueEntries
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dues/sellers/:name - Get due entries for specific seller
router.get('/sellers/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const dueEntries = await DueEntry.find({ sellerName: name }).sort({ createdAt: -1 });
    
    const totalDue = dueEntries.reduce((sum, entry) => sum + entry.dueAmount, 0);
    
    res.status(200).json({
      success: true,
      data: {
        sellerName: name,
        totalDue,
        dueEntries
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/dues - Create new due entry
router.post('/', validateDueEntry, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const dueEntry = await DueEntry.create(req.body);
    
    res.status(201).json({
      success: true,
      data: dueEntry
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/dues/:id - Mark due as paid (delete entry)
router.delete('/:id', async (req, res, next) => {
  try {
    const dueEntry = await DueEntry.findByIdAndDelete(req.params.id);
    
    if (!dueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Due entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Due entry marked as paid and removed'
    });
  } catch (error) {
    next(error);
  }
});

export default router;