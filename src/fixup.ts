import { CanteenPlan, DateSpec, matchCanteenByName, matchLineByName } from 'ka-mensa-fetch'
import { Cache } from './cache.js'

/**
 * Fix a single plan. This fills in missing data (specifically: IDs) by matching it against existing data
 * (specifically: human-readable names).
 *
 * Plans that are already complete, or cannot be fixed, will be returned unchanged by identity.
 * Plans that were fixed will be returned as a new object.
 *
 * @param plan The plan to fix.
 * @returns The same plan if unchanged, or a copy with fixed data.
 */
function fixup (plan: CanteenPlan): CanteenPlan {
  const canteenId = plan.id ?? matchCanteenByName(plan.name) ?? null
  if (canteenId == null) {
    // Canteen id cannot be fixed, and neither can line names without a canteen id for context.
    return plan
  }
  const lines = plan.lines.map((line) => ({ ...line, id: line.id ?? matchLineByName(canteenId, line.name) ?? null }))
  if (canteenId === plan.id && plan.lines.every((line, index) => line.id === lines[index].id)) {
    // Nothing to fix.
    return plan
  }
  return { ...plan, id: canteenId, lines }
}

/**
 * Fix all plans stored in the cache. This fills in missing data that might have been missing at cache time but is now
 * inferrable due to an updated data set. Any plans that are considered complete, or that cannot be inferred further,
 * will not be changed.
 *
 * The callback is invoked for any plan about to be changed. It can be used for logging. Additionally, returning 'false'
 * from the callback will prevent the plan from being written back out, e.g. for a dry-run.
 *
 * @param cache The cache to operate on.
 * @param callback The callback predicate, which may also have side effects.
 */
export async function fixupCache (cache: Cache, callback: ((date: DateSpec) => boolean) = () => true): Promise<void> {
  for (const date of await cache.list()) {
    const plans = await cache.get(date)
    if (plans == null) {
      continue
    }
    const fixedPlans = plans.map((plan) => fixup(plan))
    if (fixedPlans.some((fixedPlan, index) => fixedPlan !== plans[index]) && callback(date)) {
      await cache.put(date, fixedPlans)
    }
  }
}
