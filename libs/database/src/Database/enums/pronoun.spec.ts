import { Pronoun } from './pronoun.enum'

describe('Pronoun', () => {
  it('should have a total length of 4', () => {
    expect(Object.keys(Pronoun).length / 2).toBe(4)
  })
})
