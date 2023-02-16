import assert from 'node:assert'
import { formatDate, parseDate } from '../../src/util/date-format.js'

describe('date-format.ts', function () {
  describe('formatDate()', function () {
    it('formats dates correctly', function () {
      assert.strictEqual(formatDate({
        year: 2019,
        month: 0,
        day: 1
      }), '2019-01-01')
      assert.strictEqual(formatDate({
        year: 2019,
        month: 11,
        day: 1
      }), '2019-12-01')
    })
  })

  describe('parseDate()', function () {
    it('parses valid dates', function () {
      assert.deepStrictEqual(parseDate('2019-01-01'), {
        year: 2019,
        month: 0,
        day: 1
      })
      assert.deepStrictEqual(parseDate('2019-12-01'), {
        year: 2019,
        month: 11,
        day: 1
      })
    })

    it('limits month', function () {
      assert.strictEqual(parseDate('2019-00-01'), undefined)
      assert.strictEqual(parseDate('2019-13-01'), undefined)
    })

    it('limits day', function () {
      assert.strictEqual(parseDate('2019-01-00'), undefined)
      assert.strictEqual(parseDate('2019-01-32'), undefined)
    })

    it('handles leap years', function () {
      assert.deepStrictEqual(parseDate('2020-02-29'), {
        year: 2020,
        month: 1,
        day: 29
      })
      assert.strictEqual(parseDate('2019-02-29'), undefined)
    })

    it('does not parse invalid inputs', function () {
      assert.strictEqual(parseDate('2019.01.30'), undefined)
      assert.strictEqual(parseDate('3247abc'), undefined)
      assert.strictEqual(parseDate(''), undefined)
      assert.strictEqual(parseDate('.'), undefined)
      assert.strictEqual(parseDate('--'), undefined)
    })
  })
})
