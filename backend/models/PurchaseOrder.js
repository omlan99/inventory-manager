import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Buying price is required'],
    min: [0, 'Buying price cannot be negative']
  },
  totalCost: {
    type: Number,
    required: [true, 'Total cost is required'],
    min: [0, 'Total cost cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending'
  },
  orderDate: {
    type: String,
    required: [true, 'Order date is required']
  },
  deliveryDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);