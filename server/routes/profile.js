const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');

router.get('/', verifyJWT, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
