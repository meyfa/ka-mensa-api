'use strict'

const express = require('express')

const canteens = require('ka-mensa-fetch/data/canteens.json')

// CONSTANTS

/**
 * A map: canteen id -> canteen object.
 *
 * @type {Map}
 */
const CANTEENS_BY_ID = (() => {
  return new Map(canteens.map(item => [item.id, item]))
})()

/**
 * A map: canteen id -> (map: line id -> line object).
 *
 * @type {Map}
 */
const CANTEEN_LINES_BY_ID = (() => {
  return new Map(canteens.map(canteen => [
    canteen.id,
    new Map(canteen.lines.map(line => [line.id, line]))
  ]))
})()

// ROUTES

const router = express.Router()

router.get('/', async (req, res, next) => {
  res.status(200).json({ success: true, data: canteens })
})

router.get('/:canteenId', async (req, res, next) => {
  const canteen = CANTEENS_BY_ID.get(req.params.canteenId)
  if (!canteen) {
    res.status(404).json({ success: false, error: 'canteen not found' })
    return
  }
  res.status(200).json({ success: true, data: canteen })
})

router.get('/:canteenId/lines', async (req, res, next) => {
  const canteen = CANTEENS_BY_ID.get(req.params.canteenId)
  if (!canteen) {
    res.status(404).json({ success: false, error: 'canteen not found' })
    return
  }
  res.status(200).json({ success: true, data: canteen.lines })
})

router.get('/:canteenId/lines/:lineId', async (req, res, next) => {
  const linesMap = CANTEEN_LINES_BY_ID.get(req.params.canteenId)
  if (!linesMap) {
    res.status(404).json({ success: false, error: 'canteen not found' })
    return
  }
  const line = linesMap ? linesMap.get(req.params.lineId) : null
  if (!line) {
    res.status(404).json({ success: false, error: 'line not found' })
    return
  }
  res.status(200).json({ success: true, data: line })
})

// EXPORTS

module.exports = router
