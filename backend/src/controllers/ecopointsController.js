const EcoPoint = require('../models/EcoPoint');

// GET /api/ecopoints?lat=...&lng=...&radius=5
async function nearby(req, res) {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Parâmetros lat e lng são obrigatórios.' });
    }

    const radiusMeters = parseFloat(radius) * 1000;

    const points = await EcoPoint.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusMeters,
        },
      },
    }).limit(20);

    const response = points.map(p => ({
      id: p._id,
      name: p.name,
      address: p.address,
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
      categories: p.categories,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { nearby };
