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
    identifiedItem: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    material: {
      type: String,
      trim: true,
      maxlength: 80,
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
      maxlength: 700,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    classificationSource: {
      type: String,
      enum: ['gemini', 'groq', 'groq_vision', 'fallback'],
      required: true,
      default: 'fallback',
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    lat: {
      type: Number,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      min: -180,
      max: 180,
    },
    imageProvided: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

scanSchema.index({ user: 1, createdAt: -1 });
scanSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('Scan', scanSchema);
