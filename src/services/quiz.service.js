const { findQuestions, toPublic } = require("./questions.service");

function getQuiz(subject, count = 5) {
  const shuffled = [...findQuestions({ subject })].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(toPublic);
}

// answers: [{ id: 1, answer: 1 }, ...]  (answer = index of chosen option)
function scoreQuiz(answers) {
  const all = findQuestions();
  const results = answers
    .map((a) => {
      const q = all.find((x) => x.id === a.id);
      if (!q) return null;
      return {
        id: q.id,
        yourAnswer: a.answer,
        correctAnswer: q.answer,
        correct: a.answer === q.answer,
      };
    })
    .filter(Boolean);

  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  return {
    score,
    total,
    percentage: total ? Math.round((score / total) * 100) : 0,
    results,
  };
}

module.exports = { getQuiz, scoreQuiz };
