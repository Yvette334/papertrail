const router = require("express").Router();
const { listQuestions } = require("../controllers/questions.controller");

router.get("/", listQuestions);

module.exports = router;
