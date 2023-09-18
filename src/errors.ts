import { HttpStatus } from 'omniwheel'

/**
 * A special type of error that is intentionally thrown by the API.
 * It includes an HTTP status code and a message string.
 *
 * Any error not inheriting from this class will be considered a bug and results in status code 500 to be sent,
 * without revealing the error message.
 */
export class ApiError extends Error {
  readonly code: number

  constructor (code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * An ApiError to be thrown in case the request was invalid in some way (status code 400).
 */
export class BadRequestError extends ApiError {
  constructor (message: string) {
    super(HttpStatus.BAD_REQUEST, message)
    this.name = 'BadRequestError'
  }
}

/**
 * An ApiError to be thrown in case something could not be found (status code 404).
 */
export class NotFoundError extends ApiError {
  constructor (object: string) {
    super(HttpStatus.NOT_FOUND, `${object} not found`)
    this.name = 'NotFoundError'
  }
}
/**
 * An ApiError to be thrown in case something goes wrong on the server.
 */
export class InternalServerError extends ApiError {
  constructor () {
    super(HttpStatus.INTERNAL_SERVER_ERROR, 'internal_server_error')
    this.name = 'InternalServerError'
  }
}
