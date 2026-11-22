const { getQuiz, scoreQuiz } = require("../services/quiz.service");
const { saveAttempt } = require("../services/attempts.service");

function startQuiz(req, res) {
  const { subject } = req.query;
  if (!subject) {
    return res.status(400).json({ error: "subject query parameter is required" });
  }
  const questions = getQuiz(subject);
  if (questions.length === 0) {
    return res.status(404).json({ error: "No questions found for that subject" });
  }
  res.json({ count: questions.length, questions });
}

async function submitQuiz(req, res) {
  const { answers, subject } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "answers must be a non-empty array" });
  }
  const result = scoreQuiz(answers);

  if (process.env.DATABASE_URL) {
    try {
      await saveAttempt(result.score, result.total, subject);
    } catch (err) {
      console.error("Failed to save quiz attempt:", err.message);
    }
  }

  res.json(result);
}

module.exports = { startQuiz, submitQuiz };
