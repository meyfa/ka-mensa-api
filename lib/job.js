"use strict";

const fetchMensa = require("ka-mensa-fetch");
const group = require("group-items");

const cache = require("./cache");


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
    // fetch plans for all canteens, current week
    const plans = await fetchMensa({});

    // for each date: add respective plans array to cache
    for (const [date, plansForDate] of group(plans).by("date").asTuples()) {
        cache.put(date, plansForDate);
    }
}

module.exports = run;
