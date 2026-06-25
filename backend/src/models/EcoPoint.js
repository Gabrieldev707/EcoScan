const mongoose = require('mongoose');

const ecopointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    categories: [{ type: String }], // ex: ['Plástico', 'Papel']
  },
  { timestamps: true }
);

// índice geoespacial para queries de proximidade
ecopointSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EcoPoint', ecopointSchema);
