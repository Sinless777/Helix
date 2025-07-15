import { Citations, APACitation } from './citations'

describe('Citations constant', () => {
  it('should have a valid title and optional description', () => {
    expect(typeof Citations.title).toBe('string')
    expect(Citations.title.length).toBeGreaterThan(0)
    if (Citations.description !== undefined) {
      expect(typeof Citations.description).toBe('string')
      expect(Citations.description.length).toBeGreaterThan(0)
    }
  })

  it('should contain an array of APACitation objects', () => {
    expect(Array.isArray(Citations.citations)).toBe(true)
    Citations.citations.forEach((citation: APACitation) => {
      expect(typeof citation.author).toBe('string')
      expect(citation.author.length).toBeGreaterThan(0)
      expect(typeof citation.title).toBe('string')
      expect(citation.title.length).toBeGreaterThan(0)
      expect(typeof citation.source).toBe('string')
      expect(citation.source.length).toBeGreaterThan(0)
      expect(
        typeof citation.year === 'string' || typeof citation.year === 'number'
      ).toBe(true)
      if (citation.volume !== undefined) {
        expect(
          typeof citation.volume === 'string' ||
            typeof citation.volume === 'number'
        ).toBe(true)
      }
      if (citation.issue !== undefined) {
        expect(
          typeof citation.issue === 'string' ||
            typeof citation.issue === 'number'
        ).toBe(true)
      }
      if (citation.pages !== undefined) {
        expect(typeof citation.pages).toBe('string')
        expect(citation.pages.length).toBeGreaterThan(0)
      }
      if (citation.url !== undefined) {
        expect(typeof citation.url).toBe('string')
        expect(citation.url.length).toBeGreaterThan(0)
      }
      expect([
        'academic',
        'legal',
        'Third-Party Application',
        'Programming Package',
        'AI Model',
        'AI Service',
        'AI Platform',
        'AI Framework',
        'AI Library',
        'AI Tool',
        'AI API',
        'AI SDK',
        'AI Plugin',
        'AI Extension',
        'AI Component',
        'AI System',
        'AI Architecture',
        'AI Design Pattern',
        'AI Methodology',
        'AI Approach',
        'AI Technique',
      ]).toContain(citation.category)
    })
  })

  it('matches the snapshot of the Citations object', () => {
    expect(Citations).toMatchSnapshot()
  })
})
