import assert from 'node:assert'
import { Cache } from '../src/cache.js'
import { MemoryAdapter, type ReadWriteOptions } from 'fs-adapters'
import { type CanteenPlan, canteens, type DateSpec } from 'ka-mensa-fetch'
import { fixupCache } from '../src/fixup.js'

/**
 * An extension of in-memory file storage that also tracks all write operations, for asserting in tests.
 */
class TestMemoryAdapter extends MemoryAdapter {
  public writeOperations: string[] = []

  override async write (fileName: string, data: Buffer | string, options?: ReadWriteOptions): Promise<void> {
    this.writeOperations.push(fileName)
    await super.write(fileName, data, options)
  }
}

describe('fixup.ts', function () {
  before(function () {
    // If these assumptions don't hold, the tests would break.
    assert.ok(canteens.length >= 2)
    assert.ok(canteens[0].lines.length >= 2)
  })

  // Plan factory functions (for test data)
  type TestPlansFactory = (date: DateSpec) => CanteenPlan[]

  const good: TestPlansFactory = (date) => [{
    id: canteens[0].id,
    name: canteens[0].name,
    date,
    lines: [{
      id: canteens[0].lines[0].id,
      name: canteens[0].lines[0].name,
      meals: []
    }, {
      id: canteens[0].lines[1].id,
      name: canteens[0].lines[1].name,
      meals: []
    }]
  }]

  const missingCanteenId: TestPlansFactory = (date) => good(date).map((plan) => ({
    ...plan,
    id: null
  }))

  const missingLineId: TestPlansFactory = (date) => good(date).map((plan) => ({
    ...plan,
    lines: [plan.lines[0], { ...plan.lines[1], id: null }]
  }))

  const missingBoth: TestPlansFactory = (date) => good(date).map((plan) => ({
    ...plan,
    id: null,
    lines: [plan.lines[0], { ...plan.lines[1], id: null }]
  }))

  describe('fixupCache()', function () {
    it('leaves good plans alone', async function () {
      const plansSet = [
        good({ year: 2022, month: 8, day: 1 }),
        good({ year: 2022, month: 8, day: 2 }),
        good({ year: 2022, month: 8, day: 3 })
      ]
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      for (const plans of plansSet) {
        await cache.put(plans[0].date, plans)
      }
      assert.strictEqual(adapter.writeOperations.length, plansSet.length)
      const calls: DateSpec[] = []
      await fixupCache(cache, (fixedDate) => {
        calls.push(fixedDate)
        return true
      })
      // no predicate calls and no write operations (after the initial cache setup)
      assert.strictEqual(calls.length, 0)
      assert.strictEqual(adapter.writeOperations.length, plansSet.length)
    })

    it('calls the predicate for changed plans but does not write if it returns false', async function () {
      const plansSet = [
        good({ year: 2022, month: 8, day: 1 }),
        missingCanteenId({ year: 2022, month: 8, day: 2 }),
        missingLineId({ year: 2022, month: 8, day: 3 }),
        good({ year: 2022, month: 8, day: 4 }),
        missingBoth({ year: 2022, month: 8, day: 5 })
      ]
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      for (const plans of plansSet) {
        await cache.put(plans[0].date, plans)
      }
      assert.strictEqual(adapter.writeOperations.length, plansSet.length)
      const calls: DateSpec[] = []
      await fixupCache(cache, (fixedDate) => {
        calls.push(fixedDate)
        return false
      })
      // predicate called for each bad plan but not the good ones
      assert.deepStrictEqual(calls, [
        plansSet[1][0].date, // missingCanteenId
        plansSet[2][0].date, // missingLineId
        plansSet[4][0].date // missingBoth
      ])
      // no write operations (after the initial cache setup)
      assert.strictEqual(adapter.writeOperations.length, plansSet.length)
    })

    it('writes fixed files if the predicate returns true', async function () {
      const plansSet = [
        good({ year: 2022, month: 8, day: 1 }),
        missingCanteenId({ year: 2022, month: 8, day: 2 }),
        missingLineId({ year: 2022, month: 8, day: 3 }),
        good({ year: 2022, month: 8, day: 4 }),
        missingBoth({ year: 2022, month: 8, day: 5 })
      ]
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      for (const plans of plansSet) {
        await cache.put(plans[0].date, plans)
      }
      assert.strictEqual(adapter.writeOperations.length, plansSet.length)
      const calls: DateSpec[] = []
      await fixupCache(cache, (fixedDate) => {
        calls.push(fixedDate)
        return fixedDate.day === 2 || fixedDate.day === 5
      })
      // predicate called for each bad plan but not the good ones
      assert.deepStrictEqual(calls, [
        plansSet[1][0].date, // missingCanteenId
        plansSet[2][0].date, // missingLineId
        plansSet[4][0].date // missingBoth
      ])
      // 2 additional write operations after cache setup
      assert.strictEqual(adapter.writeOperations.length, plansSet.length + 2)
      assert.deepStrictEqual(adapter.writeOperations.slice(plansSet.length), ['2022-09-02.json', '2022-09-05.json'])
    })

    it('fixes the ids but keeps everything else the same', async function () {
      const plansSet = [
        missingCanteenId({ year: 2022, month: 8, day: 2 }),
        missingLineId({ year: 2022, month: 8, day: 3 }),
        missingBoth({ year: 2022, month: 8, day: 5 })
      ]
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      for (const plans of plansSet) {
        await cache.put(plans[0].date, plans)
      }
      await fixupCache(cache, () => true)
      // Each fixed "bad" plan should now equal the good plan!
      for (const plans of plansSet) {
        assert.deepStrictEqual(await cache.get(plans[0].date), good(plans[0].date))
      }
    })

    it('keeps ids as null when the name is unknown', async function () {
      const unknownCanteenName: CanteenPlan = {
        date: { year: 2022, month: 8, day: 1 },
        id: null,
        name: 'unknown canteen name',
        lines: []
      }
      const unknownLineName: CanteenPlan = {
        date: { year: 2022, month: 8, day: 2 },
        id: canteens[0].id,
        name: canteens[0].name,
        lines: [
          { id: null, name: 'unknown line name', meals: [] }
        ]
      }
      const oneKnownLineName: CanteenPlan = {
        date: { year: 2022, month: 8, day: 3 },
        id: canteens[0].id,
        name: canteens[0].name,
        lines: [
          { id: null, name: canteens[0].lines[0].name, meals: [] },
          { id: null, name: 'unknown line name', meals: [] }
        ]
      }
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      await cache.put(unknownCanteenName.date, [unknownCanteenName])
      await cache.put(unknownLineName.date, [unknownLineName])
      await cache.put(oneKnownLineName.date, [oneKnownLineName])
      const calls: DateSpec[] = []
      await fixupCache(cache, (fixedDate) => {
        calls.push(fixedDate)
        return true
      })
      // only the last one can actually be fixed, even though all of them are missing something
      assert.deepStrictEqual(calls, [oneKnownLineName.date])
      assert.strictEqual(adapter.writeOperations.length, 4)
      assert.strictEqual(adapter.writeOperations[3], '2022-09-03.json')
    })

    it('fixes plans for a date when at least one is incomplete', async function () {
      // Plans for a single date (different canteens) where just one canteen is incomplete
      const plans: CanteenPlan[] = [
        {
          date: { year: 2022, month: 8, day: 1 },
          id: canteens[0].id,
          name: canteens[0].name,
          lines: []
        },
        {
          date: { year: 2022, month: 8, day: 1 },
          id: null,
          name: canteens[1].name,
          lines: []
        }
      ]
      const adapter = new TestMemoryAdapter()
      const cache = new Cache(adapter)
      await cache.put(plans[0].date, plans)
      assert.deepStrictEqual(adapter.writeOperations, ['2022-09-01.json'])
      const calls: DateSpec[] = []
      await fixupCache(cache, (fixedDate) => {
        calls.push(fixedDate)
        return true
      })
      assert.deepStrictEqual(calls, [plans[0].date])
      assert.deepStrictEqual(adapter.writeOperations, ['2022-09-01.json', '2022-09-01.json'])
      const updatedPlans = await cache.get(plans[0].date)
      assert.ok(updatedPlans != null)
      assert.strictEqual(updatedPlans.length, 2)
      assert.deepStrictEqual(updatedPlans[0], plans[0])
      assert.deepStrictEqual(updatedPlans[1], { ...plans[1], id: canteens[1].id })
    })
  })
})
