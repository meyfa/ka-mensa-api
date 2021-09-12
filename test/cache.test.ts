import { Cache } from '../lib/cache'
import { MemoryAdapter } from 'fs-adapters'

import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

describe('cache.ts', function () {
  describe('#get()', function () {
    it('resolves to undefined for missing files', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      return expect(cache.get(date)).to.eventually.be.undefined
    })

    it('resolves to undefined repeatedly', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      return expect(cache.get(date)).to.eventually.be.fulfilled.then(() => {
        return expect(cache.get(date)).to.eventually.be.undefined
      })
    })

    it('resolves to parsed file contents for existing files', function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.from('[{"foo":"bar"}]')
      })
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      return expect(cache.get(date)).to.eventually.deep.equal([{ foo: 'bar' }])
    })

    it('resolves to contents repeatedly', function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.from('[{"foo":"bar"}]')
      })
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      return expect(cache.get(date)).to.eventually.be.fulfilled.then(() => {
        return expect(cache.get(date)).to.eventually.deep.equal([{ foo: 'bar' }])
      })
    })
  })

  describe('#put()', function () {
    it('creates the file', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const plan = {
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }
      return expect(cache.put(date, [plan])).to.eventually.be.fulfilled.then(() => {
        return expect(adapter.listFiles()).to.eventually.have.members(['2020-09-07.json'])
      })
    })

    it('writes stringified data', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const plan = {
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }
      return expect(cache.put(date, [plan])).to.eventually.be.fulfilled.then(() => {
        return expect(adapter.read('2020-09-07.json', { encoding: 'utf8' }))
          .to.eventually.equal('[{"id":"foo","name":"Foo","date":{"year":2021,"month":6,"day":7},"lines":[]}]')
      })
    })

    it('makes item available via #get()', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      const date = { year: 2020, month: 8, day: 7 }
      const contents = [{
        id: 'foo',
        name: 'Foo',
        date: { year: 2021, month: 6, day: 7 },
        lines: []
      }]
      // the next line is important, to also trigger cases where absence state
      // has been memorized
      return expect(cache.get(date)).to.eventually.be.undefined.then(() => {
        return expect(cache.put(date, contents)).to.eventually.be.fulfilled
      }).then(() => {
        return expect(cache.get(date)).to.eventually.deep.equal(contents)
      })
    })
  })

  describe('#list()', function () {
    it('resolves to an empty array for empty directories', function () {
      const adapter = new MemoryAdapter()
      const cache = new Cache(adapter)
      return expect(cache.list()).to.eventually.be.an('array').that.is.empty
    })

    it('parses dates from matching files', function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.json': Buffer.alloc(0),
        '2020-09-08.json': Buffer.alloc(0)
      })
      const cache = new Cache(adapter)
      return expect(cache.list()).to.eventually.be.an('array').with.deep.members([
        { year: 2020, month: 8, day: 7 },
        { year: 2020, month: 8, day: 8 }
      ])
    })

    it('ignores files not matching the expected name format', function () {
      const adapter = new MemoryAdapter({
        '2020-09-07.txt': Buffer.alloc(0),
        'foo.json': Buffer.alloc(0),
        '1-1-1.json': Buffer.alloc(0)
      })
      const cache = new Cache(adapter)
      return expect(cache.list()).to.eventually.be.an('array').that.is.empty
    })
  })
})
