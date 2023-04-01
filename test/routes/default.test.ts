import { startServer } from '../../src/http-server.js'
import { Cache } from '../../src/cache.js'
import { MemoryAdapter } from 'fs-adapters'
import assert from 'node:assert'
import { HttpStatus } from 'omniwheel'
import { FastifyInstance } from 'fastify'
import winston from 'winston'

const route = '/'

describe(`route: ${route}`, function () {
  let fastify: FastifyInstance | undefined
  afterEach(async () => await fastify?.close())

  it('returns empty data object', async function () {
    const cache = new Cache(new MemoryAdapter())
    fastify = await startServer(winston.createLogger({ silent: true }), cache, {})
    const response = await fastify.inject({ path: route })
    assert.strictEqual(response.statusCode, HttpStatus.OK)
    assert.deepStrictEqual(response.json(), {
      success: true,
      data: {}
    })
  })
})
