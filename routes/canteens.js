"use strict";

const express = require("express");

const canteens = require("ka-mensa-fetch/data/canteens.json");


// CONSTANTS

/**
 * An objectwith the mapping: canteen id -> canteen.
 * @type {Object}
 */
const CANTEENS_BY_ID = (() => {
    const obj = {};
    for (const item of canteens) {
        obj[item.id] = item;
    }
    return Object.freeze(obj);
})();

/**
 * An object with the mapping: canteen id -> (object: line id -> line).
 * @type {Object}
 */
const CANTEEN_LINES_BY_ID = (() => {
    const obj = {};
    for (const item of canteens) {
        const lineObj = {};
        for (const line of item.lines) {
            lineObj[line.id] = line;
        }
        obj[item.id] = lineObj;
    }
    return Object.freeze(obj);
})();


// ROUTES

const router = express.Router();

router.get("/", async (req, res, next) => {
    res.status(200).json(canteens);
});

router.get("/:canteenId", async (req, res, next) => {
    const canteen = CANTEENS_BY_ID[req.params.canteenId];
    if (!canteen) {
        res.status(404).end();
        return;
    }
    res.status(200).json(canteen);
});

router.get("/:canteenId/lines", async (req, res, next) => {
    const canteen = CANTEENS_BY_ID[req.params.canteenId];
    if (!canteen) {
        res.status(404).end();
        return;
    }
    res.status(200).json(canteen.lines);
});

router.get("/:canteenId/lines/:lineId", async (req, res, next) => {
    const linesObj = CANTEEN_LINES_BY_ID[req.params.canteenId];
    const line = linesObj ? linesObj[req.params.lineId] : null;
    if (!line) {
        res.status(404).end();
        return;
    }
    res.status(200).json(line);
});


// EXPORTS

module.exports = router;
