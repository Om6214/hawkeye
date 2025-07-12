exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

exports.logoutUser = (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: 'Logged out' });
  });
};
