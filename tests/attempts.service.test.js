jest.mock("pg", () => {
  const query = jest.fn();
  const Pool = jest.fn(() => ({ query }));
  return { Pool, __query: query };
});

const { Pool, __query: query } = require("pg");
const {
  saveAttempt,
  getAttempts,
  _resetPoolForTests,
} = require("../src/services/attempts.service");

beforeEach(() => {
  jest.clearAllMocks();
  _resetPoolForTests();
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/papertrail";
});

afterEach(() => {
  delete process.env.DATABASE_URL;
});

test("saveAttempt inserts a row and returns it", async () => {
  const row = {
    id: 1,
    subject: "Biology",
    score: 4,
    total: 5,
    percentage: "80.00",
    attempted_at: "2026-11-21T10:00:00.000Z",
  };
  query.mockResolvedValueOnce({ rows: [row] });

  const result = await saveAttempt(4, 5, "Biology");

  expect(Pool).toHaveBeenCalledTimes(1);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining("INSERT INTO attempts"),
    ["Biology", 4, 5, 80]
  );
  expect(result).toEqual(row);
});

test("saveAttempt calculates zero percentage when total is 0", async () => {
  query.mockResolvedValueOnce({
    rows: [{ id: 2, subject: null, score: 0, total: 0, percentage: "0.00" }],
  });

  await saveAttempt(0, 0, null);

  expect(query).toHaveBeenCalledWith(expect.any(String), [null, 0, 0, 0]);
});

test("getAttempts returns rows ordered by the query", async () => {
  const rows = [
    { id: 2, subject: "Math", score: 3, total: 5, percentage: "60.00" },
    { id: 1, subject: "Biology", score: 5, total: 5, percentage: "100.00" },
  ];
  query.mockResolvedValueOnce({ rows });

  const result = await getAttempts();

  expect(query).toHaveBeenCalledWith(expect.stringContaining("ORDER BY attempted_at DESC"));
  expect(result).toEqual(rows);
});
