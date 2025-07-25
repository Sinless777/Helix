import RoadmapPhases, { Phase, Task } from './roadmap'

describe('RoadmapPhases array', () => {
  it('should be an array of Phase objects', () => {
    expect(Array.isArray(RoadmapPhases)).toBe(true)
    RoadmapPhases.forEach((phase: Phase) => {
      expect(phase).toHaveProperty('phase')
      expect(['number', 'string']).toContain(typeof phase.phase)
      expect(typeof phase.title).toBe('string')
      expect(phase.title.length).toBeGreaterThan(0)
      expect(typeof phase.description).toBe('string')
      expect(phase.description.length).toBeGreaterThan(0)
      expect(typeof phase.time_frame).toBe('string')
      expect(phase.time_frame.length).toBeGreaterThan(0)
      expect(['not-started', 'in-progress', 'completed']).toContain(
        phase.status
      )
      expect(Array.isArray(phase.tasks)).toBe(true)
    })
  })

  it('should contain the expected number of phases', () => {
    // There are 7 phases defined (1 through 6 and future-development)
    expect(RoadmapPhases).toHaveLength(7)
  })

  it('should validate tasks structure within each phase', () => {
    RoadmapPhases.forEach((phase: Phase) => {
      phase.tasks.forEach((task: Task) => {
        expect(typeof task.id).toBe('number')
        expect(typeof task.title).toBe('string')
        expect(task.title.length).toBeGreaterThan(0)
        expect(typeof task.description).toBe('string')
        expect(task.description.length).toBeGreaterThan(0)
        expect(['not-started', 'in-progress', 'completed']).toContain(
          task.status
        )
        if (task.assigned_to !== undefined) {
          expect(typeof task.assigned_to).toBe('string')
          expect(task.assigned_to.length).toBeGreaterThan(0)
        }
        if (task.due_date !== undefined) {
          expect(typeof task.due_date).toBe('string')
          expect(task.due_date.length).toBeGreaterThan(0)
        }
        if (task.completion_date !== undefined) {
          expect(typeof task.completion_date).toBe('string')
          expect(task.completion_date.length).toBeGreaterThan(0)
        }
      })
    })
  })

  it('matches the snapshot of RoadmapPhases', () => {
    expect(RoadmapPhases).toMatchSnapshot('RoadmapPhases')
  })
})
