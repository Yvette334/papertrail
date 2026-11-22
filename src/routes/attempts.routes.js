const router = require("express").Router();
const { listAttempts, createAttempt } = require("../controllers/attempts.controller");

router.get("/", listAttempts);
router.post("/", createAttempt);

module.exports = router;
