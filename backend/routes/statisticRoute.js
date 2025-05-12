import express from 'express';
import { getStatisticsByRole } from '../controllers/statisticsController.js';

const router = express.Router();

router.get('/:role', getStatisticsByRole);

export default router;
