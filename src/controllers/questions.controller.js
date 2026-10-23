const { findQuestions, toPublic } = require("../services/questions.service");

function listQuestions(req, res) {
  const { subject, year, topic } = req.query;
  const results = findQuestions({ subject, year, topic }).map(toPublic);
  res.json({ count: results.length, questions: results });
}

module.exports = { listQuestions };
