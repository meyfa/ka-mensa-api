"use strict";

const express = require("express");
const ms = require("ms");

const config = require("./config");
const runFetchJob = require("./lib/job");


// STARTUP ROUTINE

(async () => {
    // setup fetch job
    const fetchInterval = ms(config.fetchJob.interval);
    await runFetchJob();
    setInterval(runFetchJob, fetchInterval);

    const app = express();

    // routes
    const router = express.Router();
    router.use("/", require("./routes/default"));
    router.use("/meta", require("./routes/meta"));
    router.use("/canteens", require("./routes/canteens"));
    router.use("/plans", require("./routes/plans"));
    app.use(config.server.base, router);

    // listen
    const port = config.server.port;
    const host = config.server.host;
    app.listen(port, host, () => {
        console.log("Server listening on :" + port);
    });
})();
