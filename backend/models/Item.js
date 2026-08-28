const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Item type is required'],
      enum: {
        values: ['lost', 'found'],
        message: 'Type must be either "lost" or "found"',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Electronics',
          'Documents',
          'Clothing',
          'Accessories',
          'Books',
          'Keys',
          'Wallet/Purse',
          'Stationery',
          'Sports Equipment',
          'Other',
        ],
        message: 'Invalid category',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    image: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'expired'],
      default: 'active',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactInfo: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, category: 1, status: 1 });
itemSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Item', itemSchema);
