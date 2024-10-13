/**
 * Convert a comma-delimited string into an array of unique entries,
 * which must all be contained in the set of allowed values.
 *
 * @param str The string to parse (e,g, 'foo,bar')
 * @param allowedValues The allowed set (e.g. ['foo', 'bar']).
 * @returns The entries, or undefined if parsing failed.
 */
export function parseCommaFilter (str: string, allowedValues: string[]): string[] | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (str == null || str.length === 0) {
    return undefined
  }
  const items = [...new Set(str.split(','))]
  return items.every((item) => allowedValues.includes(item)) ? items : undefined
}
