const router = require("express").Router();

router.get("/", (req, res) => {
  console.log("Hello world");
  res.json({ message: "Application responding", status: true });
});

module.exports = router;
