const { getQuiz, scoreQuiz } = require("../services/quiz.service");

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

function submitQuiz(req, res) {
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: "answers must be a non-empty array" });
  }
  res.json(scoreQuiz(answers));
}

module.exports = { startQuiz, submitQuiz };
