const { getAttempts, saveAttempt } = require("../services/attempts.service");

async function listAttempts(req, res) {
  try {
    const attempts = await getAttempts();
    res.json({ count: attempts.length, attempts });
  } catch (err) {
    console.error("listAttempts failed:", err.message);
    res.status(503).json({ error: "Database unavailable" });
  }
}

async function createAttempt(req, res) {
  const { score, total, subject } = req.body || {};
  if (typeof score !== "number" || typeof total !== "number") {
    return res.status(400).json({ error: "score and total must be numbers" });
  }
  try {
    const attempt = await saveAttempt(score, total, subject);
    res.status(201).json(attempt);
  } catch (err) {
    console.error("createAttempt failed:", err.message);
    res.status(503).json({ error: "Database unavailable" });
  }
}

module.exports = { listAttempts, createAttempt };
