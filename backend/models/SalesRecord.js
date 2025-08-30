import mongoose from 'mongoose';

const salesItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: [0, 'Selling price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
});

const salesRecordSchema = new mongoose.Schema({
  sellerName: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  items: [salesItemSchema],
  totalSalesAmount: {
    type: Number,
    required: [true, 'Total sales amount is required'],
    min: [0, 'Total sales amount cannot be negative']
  },
  totalDueAmount: {
    type: Number,
    default: 0,
    min: [0, 'Due amount cannot be negative']
  },
  cashSaleAmount: {
    type: Number,
    required: [true, 'Cash sale amount is required'],
    min: [0, 'Cash sale amount cannot be negative']
  },
  date: {
    type: String,
    required: [true, 'Sale date is required']
  }
}, {
  timestamps: true
});

export default mongoose.model('SalesRecord', salesRecordSchema);