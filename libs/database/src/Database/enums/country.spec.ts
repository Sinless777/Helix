import { Country } from './country.enum'

describe('Country', () => {
  it('should have a total length of 197 countries including PreferNotToSay', () => {
    expect(Object.keys(Country).length / 2).toBe(197)
  })

  it('should have a total of 196 countries excluding PreferNotToSay', () => {
    expect(Object.keys(Country).length / 2 - 1).toBe(196)
  })
})
