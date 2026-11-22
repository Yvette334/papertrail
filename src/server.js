require("dotenv").config();
const app = require("./app");
const { initDb } = require("./services/attempts.service");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error("Database init skipped/failed:", err.message);
  }

  app.listen(PORT, () => console.log(`PaperTrail API running on port ${PORT}`));
}

start();
