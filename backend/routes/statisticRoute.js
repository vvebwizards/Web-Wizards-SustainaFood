import express from 'express';
import { getStatisticsByRole } from '../controllers/statisticsController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get statistics by role (dynamic route)
router.get('/:role', getStatisticsByRole);

// Specific role endpoints (aliases)
const roles = ['donor', 'recipient', 'volunteer', 'admin'];

roles.forEach(role => {
  router.get(`/${role}`, (req, res) => {
    // Forward to the role-based endpoint with the specified role
    req.params = { ...req.params, role };
    return getStatisticsByRole(req, res);
  });
});

export default router;
