const mongoose = require('mongoose');

const ALERT_TYPES = [
  'illegal_dumping',
  'overflowing_bin',
  'street_litter',
  'hazardous_waste',
  'blocked_drain',
  'other',
];

const SEVERITIES = ['low', 'medium', 'high'];
const STATUSES = ['received', 'under_review', 'forwarded', 'resolved', 'rejected'];

const ecoAlertSchema = new mongoose.Schema(
  {
    alertCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ALERT_TYPES,
      required: true,
      default: 'other',
    },
    severity: {
      type: String,
      enum: SEVERITIES,
      required: true,
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      required: true,
      default: 'received',
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700,
    },
    detectedItems: {
      type: [String],
      default: [],
    },
    risks: {
      type: [String],
      default: [],
    },
    recommendedAction: {
      type: String,
      required: true,
      trim: true,
      maxlength: 700,
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
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageProvided: {
      type: Boolean,
      required: true,
      default: true,
    },
    analysisSource: {
      type: String,
      enum: ['gemini', 'fallback'],
      required: true,
      default: 'fallback',
    },
  },
  { timestamps: true },
);

ecoAlertSchema.index({ createdAt: -1 });
ecoAlertSchema.index({ user: 1, createdAt: -1 });
ecoAlertSchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model('EcoAlert', ecoAlertSchema);
