const router = require("express").Router();
const { startQuiz, submitQuiz } = require("../controllers/quiz.controller");

router.get("/", startQuiz);
router.post("/submit", submitQuiz);

module.exports = router;
