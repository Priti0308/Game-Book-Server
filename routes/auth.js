const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

// Universal login (admin or vendor)
router.post("/login", login);

module.exports = router;
