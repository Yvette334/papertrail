const request = require("supertest");
const app = require("../src/app");

test("GET /api/questions filters by subject", async () => {
  const res = await request(app).get("/api/questions?subject=Biology");
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(5);
  expect(res.body.questions[0]).not.toHaveProperty("answer");
});

test("GET /api/quiz requires subject", async () => {
  const res = await request(app).get("/api/quiz");
  expect(res.status).toBe(400);
});

test("POST /api/quiz/submit returns score", async () => {
  const res = await request(app)
    .post("/api/quiz/submit")
    .send({ answers: [{ id: 12, answer: 0 }] });
  expect(res.status).toBe(200);
  expect(res.body.score).toBe(1);
});
