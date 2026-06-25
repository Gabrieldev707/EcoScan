const { Router } = require('express');
const { createScan, listScans } = require('../controllers/scansController');
const auth = require('../middleware/auth');

const router = Router();

router.use(auth); // todas as rotas de scans exigem login

router.post('/', createScan);
router.get('/', listScans);

module.exports = router;
