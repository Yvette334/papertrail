const express = require("express");
const cors = require("cors");
const questionsRoutes = require("./routes/questions.routes");
// Add after the quiz PR is merged:
// const quizRoutes = require("./routes/quiz.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "papertrail" }));
app.use("/api/questions", questionsRoutes);
// Add after the quiz PR is merged:
// app.use("/api/quiz", quizRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

module.exports = app;
