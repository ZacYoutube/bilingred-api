const Token = require("../controller/tokenController");
const express = require("express");

const router = express.Router();

router.delete("/:token", Token.deleteToken);

module.exports = router;
