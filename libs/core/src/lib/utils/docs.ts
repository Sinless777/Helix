import type { Phase } from '../types/docs'

/** % of tasks completed in a phase (0..100). */
export function phasePercentComplete(phase: Phase): number {
  if (!phase.tasks.length) return 0
  const done = phase.tasks.filter((t) => t.status === 'completed').length
  return Math.round((done / phase.tasks.length) * 100)
}

/** Sanity checks: unique IDs and valid edge cases. Returns a list of issues. */
export function validateRoadmap(phases: Phase[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const p of phases) {
    for (const t of p.tasks) {
      if (seen.has(t.id)) problems.push(`Duplicate task id "${t.id}" detected.`)
      seen.add(t.id)

      if (t.completion_date && t.status !== 'completed') {
        problems.push(
          `Task "${t.id}" has completion_date but status="${t.status}".`
        )
      }
    }
  }
  return problems
}
