import { DateSpec } from 'ka-mensa-fetch'

/**
 * Format the given date spec into a string YYYY-MM-DD.
 *
 * @param date The date object.
 * @returns The formatted string.
 */
export function formatDate (date: DateSpec): string {
  return `${date.year}`.padStart(4, '0') + '-' + `${date.month + 1}`.padStart(2, '0') + '-' + `${date.day}`.padStart(2, '0')
}

/**
 * Parse the given date string into a date object. This doesn't validate the date semantics.
 *
 * @param str The date string.
 * @returns The parse result.
 */
export function parseDate (str: string): DateSpec | undefined {
  // This doesn't care about some aspects of the date, like leap years.
  // That's not a problem for our use-case.
  const match = str.match(/^(\d{4})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)
  if (match == null) {
    return undefined
  }
  return {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10) - 1,
    day: Number.parseInt(match[3], 10)
  }
}
