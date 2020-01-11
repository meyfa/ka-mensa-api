"use strict";

const { expect } = require("chai");

const { PresenceSet, UNDEFINED, ABSENT, PRESENT } = require("../lib/presenceset.js");

describe("presenceset.js", function () {

    it("returns UNDEFINED by default", function () {
        const obj = new PresenceSet();
        expect(obj.get("a")).to.equal(UNDEFINED);
    });

    it("returns value that was set", function () {
        const obj = new PresenceSet();
        obj.set("a", ABSENT);
        obj.set("b", PRESENT);
        expect(obj.get("a")).to.equal(ABSENT);
        expect(obj.get("b")).to.equal(PRESENT);
    });

    it("allows UNDEFINED to be set", function () {
        const obj = new PresenceSet();
        obj.set("a", ABSENT);
        obj.set("a", UNDEFINED);
        obj.set("b", PRESENT);
        obj.set("b", UNDEFINED);
        expect(obj.get("a")).to.equal(UNDEFINED);
        expect(obj.get("b")).to.equal(UNDEFINED);
    });

    it("throws for values other than state constants", function () {
        const obj = new PresenceSet();
        expect(() => obj.set("a", "foo")).to.throw();
    });

});
