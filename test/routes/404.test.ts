import { startServer } from '../../src/http-server.js'
import { Cache } from '../../src/cache.js'
import { MemoryAdapter } from 'fs-adapters'
import assert from 'node:assert'
import { HttpStatus } from 'omniwheel'
import { FastifyInstance } from 'fastify'
import winston from 'winston'
import { defaultOptions } from './fixtures.js'

const route = '/does-not-exist'

describe(`route: ${route}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns a 404 response', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(winston.createLogger({ silent: true }), cache, defaultOptions)
    const response = await fastify.inject({ path: route })
    assert.strictEqual(response.statusCode, HttpStatus.NOT_FOUND)
    assert.deepStrictEqual(response.json(), {
      error: 'route not found'
    })
  })
})
