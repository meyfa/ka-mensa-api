import type { FastifyReply } from 'fastify'
import type { ApiError } from './errors.js'

/**
 * Respond with an error message.
 *
 * @param reply The Fastify reply object.
 * @param error The error to send.
 * @returns The reply object.
 */
export async function sendError (reply: FastifyReply, error: ApiError): Promise<FastifyReply> {
  return await reply.code(error.code).send({
    error: error.message
  })
}

/**
 * Send a success response containing the given result data.
 *
 * @param reply The Fastify reply object.
 * @param data The result data.
 * @returns The reply object.
 */
export async function sendResult (reply: FastifyReply, data: any): Promise<void> {
  return await reply.code(200).send({
    success: true,
    data
  })
}
