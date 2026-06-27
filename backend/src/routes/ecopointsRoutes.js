const { Router } = require('express');

const ecopointsController = require('../controllers/ecopointsController');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { nearbyEcoPointsQuerySchema } = require('../schemas/ecopointSchemas');

const router = Router();

router.use(requireAuth);
router.get('/', validate({ query: nearbyEcoPointsQuerySchema }), ecopointsController.listNearbyEcoPoints);

module.exports = router;
