const express = require('express')
const axios = require('axios')
const router = express.Router();
const {getUserRepo} = require('../controllers/githubController')

router.get('/repos',getUserRepo);

module.exports = router;