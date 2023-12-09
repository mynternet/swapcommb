const router = require("express").Router();
const path = require("path");

router.use((req, res) => {
  res.sendFile(path.join(__dirname, "http://swapcomm.vercel.app/index.html"));
});

module.exports = router;
