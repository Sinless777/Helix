import { pages } from './index'

describe('Home pages configuration', () => {
  it('should be an array of page objects', () => {
    expect(Array.isArray(pages)).toBe(true)
    pages.forEach((page) => {
      expect(page).toHaveProperty('name')
      expect(typeof page.name).toBe('string')
      expect(page.name.length).toBeGreaterThan(0)
      expect(page).toHaveProperty('url')
      expect(typeof page.url).toBe('string')
      expect(page.url.length).toBeGreaterThan(0)
    })
  })

  it('should contain the expected number of pages', () => {
    // There should be 5 pages defined
    expect(pages).toHaveLength(5)
  })

  it('matches the snapshot of pages array', () => {
    expect(pages).toMatchSnapshot()
  })
})
