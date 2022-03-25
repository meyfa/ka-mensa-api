import { createRequire } from 'node:module'
import { LegendItem } from 'ka-mensa-fetch'

const legend: LegendItem[] = createRequire(import.meta.url)('ka-mensa-fetch/data/legend.json')

/**
 * API controller for retrieving the legend.
 */
export class LegendController {
  /**
   * Obtain all legend entries.
   *
   * @returns The full legend.
   */
  async getLegend (): Promise<LegendItem[]> {
    return legend
  }
}
