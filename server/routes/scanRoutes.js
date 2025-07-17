const express = require('express');
const router = express.Router();
const { runTruffleHogScan,getScanResultById } = require('../controllers/scanController');

router.post('/trufflehog', runTruffleHogScan); // POST /api/scan/full
router.get('/result/:scan_id', getScanResultById); //get result

module.exports = router;
