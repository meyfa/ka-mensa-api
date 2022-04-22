import { LegendItem, legend } from 'ka-mensa-fetch'

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
