import { NetworkingCards } from './networking'
import type { CardProps, ListItemProps } from '../../types/card'

describe('NetworkingCards constant', () => {
  it('should be an array of CardProps objects', () => {
    expect(Array.isArray(NetworkingCards)).toBe(true)
    expect(NetworkingCards.length).toBeGreaterThan(0)
  })

  it('each card should match the CardProps interface', () => {
    NetworkingCards.forEach((card: CardProps) => {
      expect(typeof card.title).toBe('string')
      expect(card.title.length).toBeGreaterThan(0)

      expect(typeof card.description).toBe('string')
      expect(card.description.length).toBeGreaterThan(0)

      expect(Array.isArray(card.listItems)).toBe(true)
      expect(card.listItems?.length).toBeGreaterThan(0)
      card.listItems?.forEach((item: ListItemProps) => {
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
  })

  it('matches the snapshot of NetworkingCards', () => {
    expect(NetworkingCards).toMatchSnapshot()
  })
})
