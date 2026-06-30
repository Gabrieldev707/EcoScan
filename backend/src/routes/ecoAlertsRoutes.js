const { Router } = require('express');

const ecoAlertsController = require('../controllers/ecoAlertsController');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createEcoAlertSchema, listEcoAlertsQuerySchema } = require('../schemas/ecoAlertSchemas');

const router = Router();

router.use(requireAuth);
router.post('/', validate({ body: createEcoAlertSchema }), ecoAlertsController.createEcoAlert);
router.get('/', validate({ query: listEcoAlertsQuerySchema }), ecoAlertsController.listEcoAlerts);

module.exports = router;
