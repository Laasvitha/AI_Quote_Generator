require('dotenv').config();

function authAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token' });
  }

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Access denied: Invalid admin token' });
  }

  next(); // token is valid, proceed
}

module.exports = authAdmin;
