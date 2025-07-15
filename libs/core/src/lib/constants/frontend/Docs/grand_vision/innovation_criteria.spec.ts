import { InnovationCriteria } from './innovation_criteria'

describe('InnovationCriteria array', () => {
  it('should be an array of strings', () => {
    expect(Array.isArray(InnovationCriteria)).toBe(true)
    InnovationCriteria.forEach((criterion) => {
      expect(typeof criterion).toBe('string')
      expect(criterion.length).toBeGreaterThan(0)
    })
  })

  it('should contain the expected number of criteria', () => {
    // There are 20 criteria defined
    expect(InnovationCriteria).toHaveLength(20)
  })

  it('matches the snapshot of criteria list', () => {
    expect(InnovationCriteria).toMatchSnapshot()
  })
})
