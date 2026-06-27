const mongoose = require('mongoose');

const CATEGORIES = ['Plástico', 'Papel', 'Metal', 'Vidro', 'Orgânico', 'Rejeito'];

const ecoPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    categories: {
      type: [String],
      enum: CATEGORIES,
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

ecoPointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EcoPoint', ecoPointSchema);
