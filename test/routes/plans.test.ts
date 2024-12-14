import { startServer } from '../../src/http-server.js'
import { Cache } from '../../src/cache.js'
import { MemoryAdapter } from 'fs-adapters'
import assert from 'node:assert'
import { HttpStatus } from 'omniwheel'
import type { FastifyInstance, LightMyRequestResponse } from 'fastify'
import { canteens } from 'ka-mensa-fetch'
import winston from 'winston'
import { defaultOptions } from './fixtures.js'

const route = '/plans'

describe(`route: ${route}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns expected data (empty cache)', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    const response = await fastify.inject({ path: route })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: []
    })
  })

  it('returns expected data (non-empty cache)', async function () {
    const cache = new Cache(new MemoryAdapter())
    await cache.put({ year: 2022, month: 2, day: 17 }, [])
    await cache.put({ year: 2023, month: 2, day: 13 }, [])
    await cache.put({ year: 2023, month: 2, day: 14 }, [])
    await cache.put({ year: 2023, month: 3, day: 3 }, [])
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    const response = await fastify.inject({ path: route })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: [
        { date: { year: 2022, month: 2, day: 17 } },
        { date: { year: 2023, month: 2, day: 13 } },
        { date: { year: 2023, month: 2, day: 14 } },
        { date: { year: 2023, month: 3, day: 3 } }
      ]
    })
  })
})

describe(`route: ${route}/{date}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('disallows non-date paths', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    for (const input of ['foo', '2021-02-17T12:00:00Z', '--', 'YYYY-MM-DD']) {
      const response: LightMyRequestResponse = await fastify.inject({ path: `${route}/${input}` })
      assert.strictEqual(response.statusCode, HttpStatus.NOT_FOUND, `input: ${input}`)
      assert.deepStrictEqual(response.json(), {
        error: 'route not found'
      }, `input: ${input}`)
    }
    for (const input of ['0000-00-00', '2023-00-01', '2023-13-01', '2023-04-00', '2023-04-32']) {
      const response: LightMyRequestResponse = await fastify.inject({ path: `${route}/${input}` })
      assert.strictEqual(response.statusCode, HttpStatus.BAD_REQUEST, `input: ${input}`)
      assert.deepStrictEqual(response.json(), {
        error: 'malformed date'
      })
    }
  })

  it('returns 404 for non-cached dates', async function () {
    const cache = new Cache(new MemoryAdapter())
    await cache.put({ year: 2023, month: 2, day: 13 }, [])
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    const response = await fastify.inject({ path: `${route}/2023-03-15` })
    assert.strictEqual(response.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response.json(), {
      error: 'plan not found'
    })
  })

  it('returns the plan when available', async function () {
    const cache = new Cache(new MemoryAdapter())
    await cache.put({ year: 2023, month: 2, day: 13 }, [])
    await cache.put({ year: 2023, month: 2, day: 14 }, [
      {
        id: canteens[0].id,
        date: { year: 2023, month: 2, day: 14 },
        name: canteens[0].name,
        lines: canteens[0].lines.map((line) => ({
          id: line.id,
          name: line.name,
          meals: [
            {
              name: 'foo bar baz',
              price: '1,50 €',
              additives: ['We', 'So'],
              classifiers: ['VG']
            }
          ]
        }))
      }
    ])
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    const response1 = await fastify.inject({ path: `${route}/2023-03-13` })
    assert.strictEqual(response1.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response1.json(), {
      success: true,
      data: []
    })
    const response2 = await fastify.inject({ path: `${route}/2023-03-14` })
    assert.strictEqual(response2.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response2.json(), {
      success: true,
      data: [
        // The response uses a slightly different format than the cache
        {
          canteen: {
            id: canteens[0].id,
            name: canteens[0].name
          },
          date: { year: 2023, month: 2, day: 14 },
          lines: canteens[0].lines.map((line) => ({
            id: line.id,
            name: line.name,
            meals: [
              {
                name: 'foo bar baz',
                price: '1,50 €',
                additives: ['We', 'So'],
                classifiers: ['VG']
              }
            ]
          }))
        }
      ]
    })
  })

  it('disallows invalid canteen filters', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    for (const input of ['', 'foo', ',adenauerring', 'adenauerring,', 'foo bar']) {
      const response: LightMyRequestResponse = await fastify.inject({
        path: `${route}/2023-03-15`,
        query: { canteens: input }
      })
      assert.strictEqual(response.statusCode, HttpStatus.BAD_REQUEST, `input: ${input}`)
      assert.deepStrictEqual(response.json(), {
        error: 'invalid filter: canteens'
      })
    }
    // also try with a repeated query parameter
    const response: LightMyRequestResponse = await fastify.inject({
      path: `${route}/2023-03-15`,
      query: {
        canteens: ['adenauerring', 'moltke']
      }
    })
    assert.strictEqual(response.statusCode, HttpStatus.BAD_REQUEST)
    assert.deepStrictEqual(response.json(), {
      error: 'invalid filter: canteens'
    })
  })

  it('returns the plan with canteen filters', async function () {
    const cache = new Cache(new MemoryAdapter())
    await cache.put({ year: 2023, month: 2, day: 13 }, [])
    await cache.put({ year: 2023, month: 2, day: 14 }, [
      {
        id: canteens[0].id,
        date: { year: 2023, month: 2, day: 14 },
        name: canteens[0].name,
        lines: []
      }
    ])
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    // empty plan, but with a canteen filter
    const response1 = await fastify.inject({
      path: `${route}/2023-03-13`,
      query: { canteens: 'adenauerring' }
    })
    assert.strictEqual(response1.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response1.json(), {
      success: true,
      data: []
    })
    // non-empty plan, with a matching filter
    const response2 = await fastify.inject({
      path: `${route}/2023-03-14`,
      query: { canteens: canteens[0].id }
    })
    assert.strictEqual(response2.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response2.json(), {
      success: true,
      data: [
        {
          canteen: {
            id: canteens[0].id,
            name: canteens[0].name
          },
          date: { year: 2023, month: 2, day: 14 },
          lines: []
        }
      ]
    })
    // non-empty plan, with a non-matching filter
    const response3 = await fastify.inject({
      path: `${route}/2023-03-14`,
      query: { canteens: canteens[1].id }
    })
    assert.strictEqual(response3.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response3.json(), {
      success: true,
      data: []
    })
    // non-empty plan, with a partially matching filter
    const response4 = await fastify.inject({
      path: `${route}/2023-03-14`,
      query: { canteens: `${canteens[0].id},${canteens[1].id}` }
    })
    assert.strictEqual(response4.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response4.json(), {
      success: true,
      data: [
        {
          canteen: {
            id: canteens[0].id,
            name: canteens[0].name
          },
          date: { year: 2023, month: 2, day: 14 },
          lines: []
        }
      ]
    })
  })
})
