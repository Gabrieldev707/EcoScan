const { Router } = require('express');

const communityController = require('../controllers/communityController');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { communityOverviewQuerySchema } = require('../schemas/communitySchemas');

const router = Router();

router.use(requireAuth);
router.get('/overview', validate({ query: communityOverviewQuerySchema }), communityController.getOverview);

module.exports = router;
