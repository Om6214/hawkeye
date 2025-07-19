const express = require('express');
const router = express.Router();
const { runTruffleHogScan,getScanResultById,getUserScanResults } = require('../controllers/scanController');

router.post('/trufflehog', runTruffleHogScan); // POST /api/scan/full
router.get('/result/:scan_id', getScanResultById); //get result
router.get('/results/user/:github_id',getUserScanResults);

module.exports = router;
