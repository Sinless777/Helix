import { AIToolsCards } from './AI'
import type { CardProps } from '../../types/card'

describe('AIToolsCards constant', () => {
  it('should match the CardProps shape', () => {
    const card: CardProps = AIToolsCards
    expect(typeof card.title).toBe('string')
    expect(card.title.length).toBeGreaterThan(0)

    expect(typeof card.description).toBe('string')
    expect(card.description.length).toBeGreaterThan(0)

    expect(Array.isArray(card.listItems)).toBe(true)
    expect(card.listItems?.length).toBeGreaterThan(0)

    card.listItems?.forEach((item) => {
      expect(typeof item.text).toBe('string')
      expect(item.text.length).toBeGreaterThan(0)

      expect(typeof item.href).toBe('string')
      expect(item.href.length).toBeGreaterThan(0)

      expect(typeof item.role).toBe('string')
      expect(item.role.length).toBeGreaterThan(0)

      expect(typeof item.detailedDescription).toBe('string')
      expect(item.detailedDescription.length).toBeGreaterThan(0)
    })

    expect(typeof card.image).toBe('string')
    expect(card.image.length).toBeGreaterThan(0)

    expect(typeof card.link).toBe('string')
    expect(card.link.length).toBeGreaterThan(0)

    expect(typeof card.buttonText).toBe('string')
    expect(card.buttonText?.length).toBeGreaterThan(0)
  })

  it('matches the snapshot of AIToolsCards', () => {
    expect(AIToolsCards).toMatchSnapshot()
  })
})
