"use strict";

const { expect } = require("chai");

const parseDate = require("../../lib/util/parse-date.js");

describe("parse-date.js", function () {

    it("parses valid dates", function () {
        expect(parseDate("2019-01-01")).to.deep.equal({
            year: 2019,
            month: 0,
            day: 1,
        });
        expect(parseDate("2019-12-01")).to.deep.equal({
            year: 2019,
            month: 11,
            day: 1,
        });
    });

    it("limits month", function () {
        expect(parseDate("2019-00-01")).to.be.null;
        expect(parseDate("2019-13-01")).to.be.null;
    });

    it("limits day", function () {
        expect(parseDate("2019-01-00")).to.be.null;
        expect(parseDate("2019-01-32")).to.be.null;
    });

    it("handles leap years", function () {
        expect(parseDate("2020-02-29")).to.deep.equal({
            year: 2020,
            month: 1,
            day: 29,
        });
        expect(parseDate("2019-02-29")).to.be.null;
    });

    it("does not parse invalid inputs", function () {
        expect(parseDate("2019.01.30")).to.be.null;
        expect(parseDate("3247abc")).to.be.null;
        expect(parseDate("")).to.be.null;
        expect(parseDate(".")).to.be.null;
        expect(parseDate("--")).to.be.null;
    });

});
