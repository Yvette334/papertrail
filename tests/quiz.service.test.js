const { getQuiz, scoreQuiz } = require("../src/services/quiz.service");

test("perfect score", () => {
  const r = scoreQuiz([{ id: 1, answer: 1 }, { id: 2, answer: 2 }]);
  expect(r.score).toBe(2);
  expect(r.percentage).toBe(100);
});

test("partial score", () => {
  const r = scoreQuiz([{ id: 1, answer: 1 }, { id: 2, answer: 0 }]);
  expect(r.score).toBe(1);
  expect(r.percentage).toBe(50);
});

test("zero score", () => {
  expect(scoreQuiz([{ id: 1, answer: 0 }]).score).toBe(0);
});

test("quiz returns 5 questions without answers", () => {
  const quiz = getQuiz("Biology");
  expect(quiz).toHaveLength(5);
  expect(quiz[0]).not.toHaveProperty("answer");
});
