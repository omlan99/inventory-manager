import mongoose from 'mongoose';

const dueEntrySchema = new mongoose.Schema({
  sellerName: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true
  },
  dueAmount: {
    type: Number,
    required: [true, 'Due amount is required'],
    min: [0.01, 'Due amount must be greater than 0']
  },
  dateAdded: {
    type: String,
    required: [true, 'Date added is required']
  }
}, {
  timestamps: true
});

export default mongoose.model('DueEntry', dueEntrySchema);