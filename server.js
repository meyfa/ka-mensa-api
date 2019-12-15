"use strict";

const express = require("express");


// CONSTANTS

/**
 * Server port.
 * @type {Number}
 */
const PORT = 3000;


// STARTUP ROUTINE

(async () => {
    const app = express();

    app.get("/", async (req, res, next) => {
        res.status(200).json({ success: true });
    });

    app.listen(PORT);
})();
