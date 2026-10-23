const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/questions", () => {
  it("returns all questions when no filter is given", async () => {
    const res = await request(app).get("/api/questions");
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(15);
    expect(res.body.questions).toHaveLength(15);
  });

  it("filters by subject, ignoring case", async () => {
    const res = await request(app).get("/api/questions?subject=biology");
    expect(res.body.count).toBe(5);
    res.body.questions.forEach((q) => expect(q.subject).toBe("Biology"));
  });

  it("filters by subject and year together", async () => {
    const res = await request(app).get("/api/questions?subject=Mathematics&year=2023");
    expect(res.body.count).toBe(2);
  });

  it("filters by topic", async () => {
    const res = await request(app).get("/api/questions?topic=Geometry");
    expect(res.body.count).toBe(2);
  });

  it("returns an empty list when nothing matches", async () => {
    const res = await request(app).get("/api/questions?subject=History");
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(0);
  });

  it("never exposes the correct answer", async () => {
    const res = await request(app).get("/api/questions");
    res.body.questions.forEach((q) => expect(q).not.toHaveProperty("answer"));
  });
});

describe("unknown routes", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/nope");
    expect(res.statusCode).toBe(404);
  });
});
