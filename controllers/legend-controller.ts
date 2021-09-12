import { LegendItem } from 'ka-mensa-fetch'
import legend from 'ka-mensa-fetch/data/legend.json'

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
