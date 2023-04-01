import { startServer } from '../../src/http-server.js'
import { Cache } from '../../src/cache.js'
import { MemoryAdapter } from 'fs-adapters'
import assert from 'node:assert'
import { HttpStatus } from 'omniwheel'
import { canteens } from 'ka-mensa-fetch'
import { FastifyInstance } from 'fastify'

const route = '/canteens'

describe(`route: ${route}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns expected data', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: route })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: canteens
    })
  })
})

describe(`route: ${route}/{canteenId}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns 404 for unknown canteen', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: `${route}/foo` })
    assert.strictEqual(response.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response.json(), {
      error: 'canteen not found'
    })
  })

  it('returns the canteen data for known canteen', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: `${route}/adenauerring` })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: canteens.find(c => c.id === 'adenauerring')
    })
  })
})

describe(`route: ${route}/{canteenId}/lines`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns 404 for unknown canteen', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: `${route}/foo/lines` })
    assert.strictEqual(response.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response.json(), {
      error: 'canteen not found'
    })
  })

  it('returns the canteen line data for known canteen', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: `${route}/adenauerring/lines` })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: canteens.find(c => c.id === 'adenauerring')?.lines
    })
  })
})

describe(`route: ${route}/{canteenId}/lines/{lineId}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns 404 for unknown canteen or unknown line', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response1 = await fastify.inject({ path: `${route}/foo/lines/l1` })
    assert.strictEqual(response1.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response1.json(), {
      error: 'canteen not found'
    })
    const response2 = await fastify.inject({ path: `${route}/adenauerring/lines/bar` })
    assert.strictEqual(response2.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response2.json(), {
      error: 'line not found'
    })
  })

  it('returns the canteen line data for known canteen line', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(cache, {})
    const response = await fastify.inject({ path: `${route}/adenauerring/lines/l1` })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: canteens.find(c => c.id === 'adenauerring')?.lines.find(l => l.id === 'l1')
    })
  })
})
