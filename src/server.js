const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config');

// app.js builds the Express app; server.js starts it. Keeping them apart
// means the app can be imported by tests without opening a port.
async function start() {
  try {
    await connectDB();
    app.listen(port, () => console.log(`PaperTrail API running on port ${port}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
