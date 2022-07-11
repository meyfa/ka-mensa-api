import { CanteenLine, CanteenPlan, DateSpec } from 'ka-mensa-fetch'
import { Cache } from '../cache.js'
import { NotFoundError } from '../errors.js'

// TYPES

/**
 * The structure for plan summaries.
 */
export interface PlanSummary {
  date: DateSpec
}

/**
 * The structure for plan details.
 */
export interface PlanDetail {
  date: DateSpec
  canteen: {
    id: string | null
    name: string
  }
  lines: CanteenLine[]
}

// MAPPER

/**
 * Map the raw plan data into a presentable format.
 *
 * @param raw The plan data.
 * @returns The mapped plan.
 */
function mapPlan (raw: CanteenPlan): PlanDetail {
  return {
    date: raw.date,
    canteen: {
      id: raw.id,
      name: raw.name
    },
    lines: raw.lines
  }
}

// MAIN EXPORT

/**
 * API controller for retrieving canteen plans.
 */
export class PlansController {
  constructor (
    private readonly cache: Cache
  ) {
  }

  /**
   * Obtain a list of summaries for all available plans.
   *
   * @returns The summaries.
   */
  async getSummaries (): Promise<PlanSummary[]> {
    const dates = await this.cache.list()
    return dates.map(date => ({ date }))
  }

  /**
   * Obtain the plan for one date in detail. The plan contains either data for all canteens, or
   * limited to the given filter function.
   *
   * @param date The date.
   * @param canteensFilter Optionally, a filter to limit the returned plan details to a subset of canteens.
   * @returns The plan.
   */
  async getPlan (date: DateSpec, canteensFilter?: string[]): Promise<PlanDetail[]> {
    let data = await this.cache.get(date)
    if (data == null) {
      throw new NotFoundError('plan')
    }
    if (canteensFilter != null) {
      data = data.filter(entry => entry.id != null && canteensFilter.includes(entry.id))
    }
    return data.map(mapPlan)
  }
}
