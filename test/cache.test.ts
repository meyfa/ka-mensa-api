import assert from 'node:assert'
import { Cache } from '../src/cache.js'
import { MemoryAdapter } from 'fs-adapters'

describe('cache.ts', function () {
  describe('#get()', function () {
    it('resolves to undefined for missing files', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      assert.strictEqual(await cache.get(date), undefined)
    })

    it('resolves to undefined repeatedly', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      await cache.get(date)
      assert.strictEqual(await cache.get(date), undefined)
    })

    it('resolves to parsed file contents for existing files', async function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.from('[{"foo":"bar"}]')
      })
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      assert.deepStrictEqual(await cache.get(date), [{ foo: 'bar' }])
    })

    it('resolves to contents repeatedly', async function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.from('[{"foo":"bar"}]')
      })
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      await cache.get(date)
      assert.deepStrictEqual(await cache.get(date), [{ foo: 'bar' }])
    })
  })

  describe('#put()', function () {
    it('creates the file', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const plan = {
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }
      await cache.put(date, [plan])
      assert.deepStrictEqual(await adapter.listFiles(), ['2020-09-07.json'])
    })

    it('writes stringified data', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const plan = {
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }
      await cache.put(date, [plan])
      assert.strictEqual(await adapter.read('2020-09-07.json', { encoding: 'utf8' }),
        '[{"id":"foo","name":"Foo","date":{"year":2021,"month":6,"day":7},"lines":[]}]')
    })

    it('makes item available via #get()', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const contents = [{
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }]
      // the next line is important, to also trigger cases where absence state has been memorized
      assert.strictEqual(await cache.get(date), undefined)
      await cache.put(date, contents)
      assert.deepStrictEqual(await cache.get(date), contents)
    })
  })

  describe('#list()', function () {
    it('resolves to an empty array for empty directories', async function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      assert.deepStrictEqual(await cache.list(), [])
    })

    it('parses dates from matching files', async function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.alloc(0),
        '2020-09-08.json': Buffer.alloc(0)
      })
      const cache = new Cache(adapter)
      const list = await cache.list()
      // Note: list can have any order
      assert.strictEqual(list.length, 2)
      assert.ok(list.some((item) => item.year === 2020 && item.month === 8 && item.day === 7))
      assert.ok(list.some((item) => item.year === 2020 && item.month === 8 && item.day === 8))
    })

    it('ignores files not matching the expected name format', async function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.txt': Buffer.alloc(0),
        '2020-09-08xjson': Buffer.alloc(0),
        'foo.json': Buffer.alloc(0),
        '1-1-1.json': Buffer.alloc(0),
        '2022-09-02.json.bak': Buffer.alloc(0),
        '2022-09-03.sample.json': Buffer.alloc(0)
      })
      const cache = new Cache(adapter)
      assert.deepStrictEqual(await cache.list(), [])
    })
  })
})
