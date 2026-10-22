const questionService = require('../services/questionService');

// Controllers only deal with HTTP: read the request, validate input,
// call the service, shape the response.
async function getQuestions(req, res, next) {
  try {
    const { subject, topic, year, page, limit } = req.query;

    const parsed = {};
    if (subject) parsed.subject = String(subject);
    if (topic) parsed.topic = String(topic);

    for (const [name, value] of [['year', year], ['page', page], ['limit', limit]]) {
      if (value !== undefined) {
        const n = Number(value);
        if (!Number.isInteger(n)) {
          return res.status(400).json({ error: `'${name}' must be an integer` });
        }
        parsed[name] = n;
      }
    }

    const result = await questionService.findQuestions(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuestions };
