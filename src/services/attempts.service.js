const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function initDb() {
  if (!process.env.DATABASE_URL) return;
  const sql = fs.readFileSync(path.join(__dirname, "../db/init.sql"), "utf8");
  await getPool().query(sql);
}

async function saveAttempt(score, total, subject) {
  const percentage = total ? Math.round((score / total) * 10000) / 100 : 0;
  const result = await getPool().query(
    `INSERT INTO attempts (subject, score, total, percentage)
     VALUES ($1, $2, $3, $4)
     RETURNING id, subject, score, total, percentage, attempted_at`,
    [subject || null, score, total, percentage]
  );
  return result.rows[0];
}

async function getAttempts() {
  const result = await getPool().query(
    `SELECT id, subject, score, total, percentage, attempted_at
     FROM attempts
     ORDER BY attempted_at DESC`
  );
  return result.rows;
}

function _resetPoolForTests() {
  pool = undefined;
}

module.exports = { initDb, saveAttempt, getAttempts, _resetPoolForTests };
