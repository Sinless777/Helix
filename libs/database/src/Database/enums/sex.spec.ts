import { Sex } from './sex.enum'

describe('Sex', () => {
  it('should have a total length of 5 including PreferNotToSay', () => {
    expect(Object.keys(Sex).length / 2).toBe(5)
  })
})
