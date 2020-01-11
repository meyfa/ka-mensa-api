"use strict";

/**
 * Presence constant representing "state unknown".
 * @type {Number}
 */
const UNDEFINED = 0;

/**
 * Presence constant representing "item absent".
 * @type {Number}
 */
const ABSENT = -1;

/**
 * Presence constant representing "item present".
 * @type {Number}
 */
const PRESENT = 1;

/**
 * A set of presence values. In short, this allows unique keys to be associated
 * with values representing absence/presence.
 */
class PresenceSet {
    /**
     */
    constructor() {
        this._map = new Map();
    }

    /**
     * Get the presence value for the key.
     *
     * If the key has not been associated with a presence value, the result will
     * be UNDEFINED. Otherwise, the result will be either ABSENT or PRESENT.
     *
     * @param {*} key The unique key.
     * @return {Number} One of UNDEFINED, ABSENT, or PRESENT.
     */
    get(key) {
        return this._map.get(key) || UNDEFINED;
    }

    /**
     * Set the presence value for the key.
     *
     * @param {*} key The unique key.
     * @param {Number} state Either ABSENT or PRESENT.
     * @return {void}
     */
    set(key, state) {
        if (state === UNDEFINED) {
            this._map.delete(key);
            return;
        }
        if (state !== ABSENT && state !== PRESENT) {
            throw new Error("invalid state, must be ABSENT or PRESENT");
        }
        this._map.set(key, state);
    }
}

module.exports = { UNDEFINED, ABSENT, PRESENT, PresenceSet };
