import { TechCategory } from './tech-category.enum'

describe('TechCategory', () => {
  it('should have a total length of 26', () => {
    expect(Object.keys(TechCategory).length / 2).toBe(26)
  })
})
