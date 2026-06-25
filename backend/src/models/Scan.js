const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteType: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Plástico', 'Papel', 'Metal', 'Vidro', 'Orgânico', 'Rejeito'],
    },
    points: {
      type: Number,
      default: 0,
    },
    disposalGuide: {
      type: String,
      required: true,
    },
    canRecycle: {
      type: Boolean,
      default: false,
    },
    binColor: String,
    city: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);
