"use strict";

const express = require("express");

const cache = require("../lib/cache");
const parseDate = require("../lib/util/parse-date");


// MAPPER

/**
 * Map the raw plan data into a presentable format.
 *
 * @param {Object} raw The plan data.
 * @return {Object} The mapped plan.
 */
function mapPlan(raw) {
    return {
        date: raw.date,
        canteen: {
            id: raw.id,
            name: raw.name,
        },
        lines: raw.lines,
    };
}


// ROUTES

const router = express.Router();

router.get("/:date(\\d{4}-\\d{2}-\\d{2})", async (req, res, next) => {
    const dateObj = parseDate(req.params.date);
    if (!dateObj) {
        // TODO add error message
        res.status(400).json({});
        return;
    }

    const data = await cache.get(dateObj);
    if (!data) {
        // TODO add error message
        res.status(404).json({});
        return;
    }

    const results = data.map(mapPlan);
    res.status(200).json(results);
});


// EXPORTS

module.exports = router;
