const { Router } = require('express');

const scansController = require('../controllers/scansController');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createScanSchema, listScansQuerySchema } = require('../schemas/scanSchemas');

const router = Router();

router.use(requireAuth);
router.post('/', validate({ body: createScanSchema }), scansController.createScan);
router.get('/', validate({ query: listScansQuerySchema }), scansController.listScans);

module.exports = router;
