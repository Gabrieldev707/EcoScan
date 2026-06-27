const mongoose = require('mongoose');

const CATEGORIES = ['Plástico', 'Papel', 'Metal', 'Vidro', 'Orgânico', 'Rejeito'];

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wasteType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    binColor: {
      type: String,
      required: true,
    },
    canRecycle: {
      type: Boolean,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    disposalGuide: {
      type: String,
      required: true,
      maxlength: 500,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
  },
  { timestamps: true },
);

scanSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);