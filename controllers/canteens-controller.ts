import { Canteen, Line } from 'ka-mensa-fetch'
import canteens from 'ka-mensa-fetch/data/canteens.json'

import { NotFoundError } from '../lib/errors'

// CONSTANTS

/**
 * A map: canteen id -> canteen object.
 */
const CANTEENS_BY_ID = new Map(canteens.map(canteen => [canteen.id, canteen]))

/**
 * A map: canteen id -> (map: line id -> line object).
 */
const CANTEEN_LINES_BY_ID = new Map(canteens.map(canteen => [
  canteen.id,
  new Map(canteen.lines.map(line => [line.id, line]))
]))

// MAIN EXPORT

/**
 * API controller for retrieving general data about the available canteens.
 */
export class CanteensController {
  /**
   * Obtain information about all known canteens.
   *
   * @returns The canteen information.
   */
  async getAll (): Promise<Canteen[]> {
    return canteens
  }

  /**
   * Obtain information about just one specific canteen.
   * An ApiError will be thrown if the canteen does not exist.
   *
   * @param canteenId The id of the canteen.
   * @returns The canteen information.
   */
  async getOne (canteenId: string): Promise<Canteen> {
    const canteen = CANTEENS_BY_ID.get(canteenId)
    if (canteen == null) {
      throw new NotFoundError('canteen')
    }
    return canteen
  }

  /**
   * Obtain just the lines listing of one specific canteen.
   * An ApiError will be thrown if the canteen does not exist.
   *
   * @param canteenId The id of the canteen.
   * @returns The canteen's line array.
   */
  async getLines (canteenId: string): Promise<Line[]> {
    const canteen = CANTEENS_BY_ID.get(canteenId)
    if (canteen == null) {
      throw new NotFoundError('canteen')
    }
    return canteen.lines
  }

  /**
   * Obtain just one specific line, identified by the canteen and line ids.
   * An ApiError will be thrown if the canteen, or its line, does not exist.
   *
   * @param canteenId The id of the canteen.
   * @param lineId The id of the line.
   * @returns The line information.
   */
  async getLine (canteenId: string, lineId: string): Promise<Line> {
    const linesMap = CANTEEN_LINES_BY_ID.get(canteenId)
    if (linesMap == null) {
      throw new NotFoundError('canteen')
    }
    const line = linesMap.get(lineId)
    if (line == null) {
      throw new NotFoundError('line')
    }
    return line
  }
}
