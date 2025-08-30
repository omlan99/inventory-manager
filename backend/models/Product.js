import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  initialStock: {
    type: Number,
    required: [true, 'Initial stock is required'],
    min: [0, 'Initial stock cannot be negative']
  },
  deliveredQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Delivered quantity cannot be negative']
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative']
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Buying price is required'],
    min: [0, 'Buying price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining quantity
productSchema.virtual('remainingQuantity').get(function() {
  return this.deliveredQuantity - this.soldQuantity;
});

// Virtual for buying cost
productSchema.virtual('buyingCost').get(function() {
  return this.deliveredQuantity * this.buyingPrice;
});

// Virtual for sales value
productSchema.virtual('salesValue').get(function() {
  return this.soldQuantity * this.sellingPrice;
});

// Virtual for profit/loss
productSchema.virtual('profitLoss').get(function() {
  return (this.sellingPrice - this.buyingPrice) * this.soldQuantity;
});

export default mongoose.model('Product', productSchema);