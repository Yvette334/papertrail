// All data access is isolated in this file. The rest of the app only calls
// findQuestions() / toPublic(), so the JSON file can later be replaced by a
// database without touching the controllers or the quiz service.
const questions = require("../data/questions.json");

function findQuestions({ subject, year, topic } = {}) {
  return questions.filter(
    (q) =>
      (!subject || q.subject.toLowerCase() === subject.toLowerCase()) &&
      (!year || String(q.year) === String(year)) &&
      (!topic || q.topic.toLowerCase() === topic.toLowerCase())
  );
}

// Never send the correct answer to the client before they submit
function toPublic({ answer, ...rest }) {
  return rest;
}

module.exports = { findQuestions, toPublic };
