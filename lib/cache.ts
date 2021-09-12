import moment from 'moment'

import { parseDate } from './util/parse-date'
import { Adapter } from 'fs-adapters'
import { CanteenPlan, DateSpec } from 'ka-mensa-fetch'

// CONSTANTS

/**
 * ENOENT error code.
 */
const ENOENT = 'ENOENT'

// UTILITY METHODS

/**
 * Build the file name from the given date object.
 *
 * @param date The date object.
 * @returns The file name.
 */
function buildFileName (date: DateSpec): string {
  const formattedDate = moment(date).format('YYYY-MM-DD') as string
  return `${formattedDate}.json`
}

// EXPORTS

/**
 * A cache directory manager, providing retrieval and insertion of canteen plans.
 */
export class Cache {
  private readonly fsAdapter: Adapter

  /**
   * Construct a new Cache with the specified file system adapter.
   *
   * @param fsAdapter The I/O interface.
   */
  constructor (fsAdapter: Adapter) {
    this.fsAdapter = fsAdapter
  }

  /**
   * Get the cache contents for the given date.
   *
   * If the cache does not contain data for the given date, returns undefined.
   *
   * @param date The date object.
   * @returns Resolves to the cache contents, or undefined if not cached.
   */
  async get (date: DateSpec): Promise<CanteenPlan[] | undefined> {
    const file = buildFileName(date)

    try {
      const contents = await this.fsAdapter.read(file, { encoding: 'utf8' }) as string
      return JSON.parse(contents)
    } catch (e: any) {
      if (e != null && e.code === ENOENT) {
        // missing file - item not found
        return undefined
      }
      // some more critical error
      throw e
    }
  }

  /**
   * Insert the contents into the cache for the given date.
   *
   * @param date The date object.
   * @param contents The cache contents (array of plans for the date).
   * @returns Resolves when done.
   */
  async put (date: DateSpec, contents: CanteenPlan[]): Promise<void> {
    const file = buildFileName(date)
    await this.fsAdapter.write(file, JSON.stringify(contents))
  }

  /**
   * Obtain a list of all cached plans, in unspecified order.
   *
   * @returns Resolves to an array of date objects.
   */
  async list (): Promise<DateSpec[]> {
    const files: string[] = await this.fsAdapter.listFiles()
    return files.filter(file => {
      return /^\d{4}-\d{2}-\d{2}.json$/.test(file)
    }).map(file => {
      return parseDate(file.substring(0, file.indexOf('.')))
    }).filter((date: DateSpec | undefined): date is DateSpec => date != null)
  }
}
