const { Router } = require('express');
const { nearby } = require('../controllers/ecopointsController');
const auth = require('../middleware/auth');

const router = Router();

router.get('/', auth, nearby);

module.exports = router;
