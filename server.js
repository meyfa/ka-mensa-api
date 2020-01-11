"use strict";

const express = require("express");

const runFetchJob = require("./lib/job");


// CONSTANTS

/**
 * Server port.
 * @type {Number}
 */
const PORT = 3000;

/**
 * Time in milliseconds between automated plan fetching.
 * @type {Number}
 */
const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours


// STARTUP ROUTINE

(async () => {
    // setup fetch job
    await runFetchJob();
    setInterval(runFetchJob, FETCH_INTERVAL);

    const app = express();

    app.get("/", async (req, res, next) => {
        res.status(200).json({ success: true });
    });

    app.use("/meta", require("./routes/meta"));
    app.use("/canteens", require("./routes/canteens"));

    app.listen(PORT, () => {
        console.log("Server listening on :" + PORT);
    });
})();
