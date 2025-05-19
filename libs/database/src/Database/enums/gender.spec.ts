import { Gender } from './gender.enum'

describe('Gender', () => {
  it('should have a total length of 8', () => {
    expect(Object.keys(Gender).length / 2).toBe(8)
  })
})
