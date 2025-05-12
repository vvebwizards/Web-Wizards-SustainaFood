// routes/quizRoutes.js
import express from 'express';
import { generateQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.post('/quiz', generateQuiz);

export default router;
