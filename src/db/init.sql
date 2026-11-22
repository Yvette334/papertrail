CREATE TABLE IF NOT EXISTS attempts (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(50),
  score INTEGER,
  total INTEGER,
  percentage NUMERIC(5,2),
  attempted_at TIMESTAMP DEFAULT NOW()
);
