"use strict";

const express = require("express");


// ROUTES

const router = express.Router();

router.use("/legend", require("./legend"));


// EXPORTS

module.exports = router;
