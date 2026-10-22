const express = require('express');
const { getQuestions } = require('../controllers/questionController');

const router = express.Router();

// GET /api/questions?subject=math&year=2023&topic=algebra&page=1&limit=20
router.get('/', getQuestions);

module.exports = router;
