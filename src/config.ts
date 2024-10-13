import path from 'node:path'
import ms from 'ms'

const VALID_SOURCES = ['simplesite', 'jsonapi'] as const
const DEFAULT_CACHE_DIRECTORY = './cache'

/**
 * Configuration for the application.
 */
export interface Config {
  cacheDirectory: string
  server: {
    host: string
    port: number
  }
  corsAllowOrigin: string | undefined
  fetch: {
    interval: number
    source: typeof VALID_SOURCES[number]
  }
  simplesite: {
    days: number
  }
  jsonapi: {
    auth: {
      username: string
      password: string
    }
  }
}

/**
 * Parse the configuration from environment variables.
 *
 * @returns The configuration object.
 */
export function getConfig (): Config {
  return {
    cacheDirectory: getCacheDirectory(),
    server: {
      host: getEnvOrDefault('SERVER_HOST', '::'),
      port: validatePositiveInteger(getEnvOrDefault('SERVER_PORT', '8080'))
    },
    corsAllowOrigin: getCorsAllowOrigin(),
    fetch: {
      interval: validateDuration(getEnvOrDefault('FETCH_INTERVAL', '6 hours')),
      source: validateEnum(VALID_SOURCES, getEnvOrDefault('FETCH_SOURCE', 'simplesite'))
    },
    simplesite: {
      days: validatePositiveInteger(getEnvOrDefault('SIMPLESITE_DAYS', '14'))
    },
    jsonapi: {
      auth: {
        username: getEnvOrDefault('JSONAPI_AUTH_USERNAME', ''),
        password: getEnvOrDefault('JSONAPI_AUTH_PASSWORD', '')
      }
    }
  }
}

/**
 * Determine the absolute path to the cache directory from the environment variables. This will fall back to a default
 * cache path if the env var is not set.
 *
 * @returns The absolute cache directory path to use.
 */
function getCacheDirectory (): string {
  // backwards compatibility
  const oldDirectory = getEnvOrDefault('MENSA_CACHE_DIRECTORY', DEFAULT_CACHE_DIRECTORY)
  const directory = getEnvOrDefault('CACHE_DIRECTORY', oldDirectory)
  return path.resolve(directory)
}

/**
 * Determine the CORS origin to allow from the environment variables.
 * This function will return a string if (and only if) the option is set and is not empty.
 *
 * @returns The origin value, if it is valid, and undefined otherwise.
 */
function getCorsAllowOrigin (): string | undefined {
  const oldAllowOrigin = getEnvOrDefault('MENSA_CORS_ALLOWORIGIN', undefined)
  return getEnvOrDefault('CORS_ALLOWORIGIN', oldAllowOrigin)
}

/**
 * Get an environment variable or a default value if it is not set, or is empty.
 *
 * @param key The environment variable key.
 * @param defaultValue The default value to use.
 * @returns The value of the environment variable, or the default value.
 */
function getEnvOrDefault<D = string> (key: string, defaultValue: D): string | D {
  const value = process.env[key]
  return value != null && value !== '' ? value : defaultValue
}

/**
 * Convert a string to a positive integer.
 *
 * @param str The string to convert.
 * @returns The parsed integer.
 */
function validatePositiveInteger (str: string): number {
  const value = Number.parseInt(str, 10)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`invalid positive integer: "${str}"`)
  }
  return value
}

/**
 * Validate that a string is one of the given values.
 *
 * @param allowed The allowed values.
 * @param str The string to validate.
 * @returns The string if it is valid.
 */
function validateEnum<T extends readonly string[]> (allowed: T, str: string): T[number] {
  if (!allowed.includes(str)) {
    throw new Error(`invalid value: "${str}", allowed: ${allowed.join(', ')}`)
  }
  return str
}

/**
 * Validate a duration string.
 *
 * @param str The duration string.
 * @returns The parsed duration in milliseconds.
 */
function validateDuration (str: string): number {
  const duration = ms(str)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (duration == null || Number.isNaN(duration) || duration <= 0) {
    throw new Error(`invalid duration: "${str}"`)
  }
  return duration
}
