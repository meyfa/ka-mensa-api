import moment from 'moment'
import { DateSpec } from 'ka-mensa-fetch'

/**
 * The date format that is used.
 */
const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Format the given date spec into a string YYYY-MM-DD.
 *
 * @param date The date object.
 * @returns The formatted string.
 */
export function formatDate (date: DateSpec): string {
  return moment(date).format('YYYY-MM-DD')
}

/**
 * Parse the given date string into a date object.
 *
 * @param str The date string.
 * @returns The parse result.
 */
export function parseDate (str: string): DateSpec | undefined {
  const strict = true
  const date = moment(str, DATE_FORMAT, strict)
  if (date.isValid()) {
    return {
      year: date.year(),
      month: date.month(),
      day: date.date()
    }
  }
  return undefined
}
