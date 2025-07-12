const express = require('express');
const passport = require('passport');
const { getCurrentUser, logoutUser } = require('../controllers/authController');
const verifyJWT = require('../middlewares/verifyJWT');

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/',
    session: true
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  }
);

router.get('/user', getCurrentUser);
router.get('/logout', logoutUser);

module.exports = router;
