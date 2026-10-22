const Question = require('../models/Question');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Business logic lives here, not in the controller, so it can be reused
// (and later moved into its own service) without touching HTTP code.
async function findQuestions({ subject, topic, year, page = 1, limit = DEFAULT_LIMIT }) {
  const filter = {};
  if (subject) filter.subject = subject.trim().toLowerCase();
  if (topic) filter.topic = topic.trim().toLowerCase();
  if (year !== undefined) filter.year = year;

  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const safePage = Math.max(page, 1);

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ year: -1, createdAt: 1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Question.countDocuments(filter),
  ]);

  return { total, page: safePage, limit: safeLimit, questions };
}

module.exports = { findQuestions };
