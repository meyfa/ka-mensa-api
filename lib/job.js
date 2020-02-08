"use strict";

const fetchMensa = require("ka-mensa-fetch");
const group = require("group-items");
const moment = require("moment");

const cache = require("./cache");
const config = require("../config");


// METHODS

/**
 * Determine the dates for which plans should be fetched.
 *
 * @return {Object[]} The array of date objects.
 */
function getFetchDates() {
    const dayCount = Math.max(config.fetchJob.futureDays, 0);
    const dates = [];
    for (let i = 0, date = moment(); i <= dayCount; ++i) {
        dates.push({
            year: date.year(),
            month: date.month(),
            day: date.date(),
        });
        date.add(1, "d");
    }
    return dates;
}


// MAIN EXPORT

/**
 * Run the fetcher job, updating the available plans.
 *
 * This does not necessarily result in a complete set of plans. All it does is
 * fetch a sufficient amount of plans, so that when this is called regularly
 * there will be no gaps.
 *
 * @return {void}
 */
async function run() {
    // fetch plans for all canteens, for a few days into the future
    const dates = getFetchDates();
    const plans = await fetchMensa({ dates });

    // for each date: add respective plans array to cache
    for (const [date, plansForDate] of group(plans).by("date").asTuples()) {
        cache.put(date, plansForDate);
    }
}

module.exports = run;
