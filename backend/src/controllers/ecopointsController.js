const EcoPoint = require('../models/EcoPoint');

function toEcoPointResponse(point) {
  const source = point.toObject ? point.toObject() : point;
  const coordinates = source.location?.coordinates || [source.lng, source.lat];

  return {
    id: source._id.toString(),
    name: source.name,
    address: source.address,
    lat: coordinates[1],
    lng: coordinates[0],
    categories: source.categories,
    distance: typeof source.distanceMeters === 'number'
      ? Number((source.distanceMeters / 1000).toFixed(2))
      : undefined,
  };
}

async function listNearbyEcoPoints(req, res, next) {
  try {
    const { lat, lng, radius } = req.validated.query;

    const points = await EcoPoint.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distanceMeters',
          maxDistance: radius * 1000,
          spherical: true,
          query: { active: true },
        },
      },
      { $sort: { distanceMeters: 1 } },
      {
        $project: {
          name: 1,
          address: 1,
          categories: 1,
          location: 1,
          distanceMeters: 1,
        },
      },
    ]);

    res.json(points.map(toEcoPointResponse));
  } catch (error) {
    next(error);
  }
}

module.exports = { listNearbyEcoPoints };
