import { Sexuality } from './sexuality.enum'

describe('Sexuality', () => {
  it('should have a total length of 31 including PreferNotToSay', () => {
    expect(Object.keys(Sexuality).length / 2).toBe(31)
  })
})
