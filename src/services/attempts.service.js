"use strict";

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// ---------- State ----------

// Lazily created, shared connection pool
let pool;

// ---------- TLS configuration ----------

/**
 * Decide how to connect to Postgres over TLS.
 *  - Local databases (localhost / 127.0.0.1) or DATABASE_SSL=false: no TLS
 *  - RDS CA bundle present: TLS with certificate verification
 *  - Bundle missing: TLS without verification (logs a warning)
 */
function buildSsl() {
  const url = process.env.DATABASE_URL || "";

  if (process.env.DATABASE_SSL === "false" || /localhost|127\.0\.0\.1/.test(url)) {
    return false; // local development database without TLS
  }

  const caPath = path.join(__dirname, "../db/rds-ca-bundle.pem");
  if (fs.existsSync(caPath)) {
    return { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true };
  }

  console.warn("RDS CA bundle not found; TLS is on but the certificate is not verified");
  return { rejectUnauthorized: false };
}

// ---------- Pool management ----------

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: buildSsl(),
    });
  }
  return pool;
}

/** Test helper: forget the cached pool so the next getPool() builds a new one. */
function _resetPoolForTests() {
  pool = undefined;
}

// ---------- Database setup ----------

async function initDb() {
  if (!process.env.DATABASE_URL) return;
  const sql = fs.readFileSync(path.join(__dirname, "../db/init.sql"), "utf8");
  await getPool().query(sql);
}

// ---------- Attempts ----------

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

// ---------- Exports ----------

module.exports = {
  initDb,
  saveAttempt,
  getAttempts,
  getPool,
  buildSsl,
  _resetPoolForTests,
};