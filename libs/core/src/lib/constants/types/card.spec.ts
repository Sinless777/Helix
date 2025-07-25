import type { CardProps, ListItemProps } from './card'

describe('CardProps and ListItemProps type integrity', () => {
  it('should allow constructing a minimal valid ListItemProps object', () => {
    const item: ListItemProps = {
      text: 'Example',
      href: '/example',
      role: 'Test Role',
      detailedDescription: 'Detailed description text',
    }
    expect(item).toBeDefined()
    expect(typeof item.text).toBe('string')
    expect(typeof item.href).toBe('string')
    expect(typeof item.role).toBe('string')
    expect(typeof item.detailedDescription).toBe('string')
  })

  it('should allow constructing a minimal valid CardProps object', () => {
    const listItem: ListItemProps = {
      text: 'Example',
      href: '/example',
      role: 'Test Role',
      detailedDescription: 'Detailed description text',
    }
    const card: CardProps = {
      title: 'Test Title',
      description: 'Test Description',
      listItems: [listItem],
      image: '/path/to/image.png',
      link: '/test-link',
      buttonText: 'Click Here',
    }
    expect(card).toBeDefined()
    expect(typeof card.title).toBe('string')
    expect(typeof card.description).toBe('string')
    expect(Array.isArray(card.listItems)).toBe(true)
    expect(card.listItems?.[0]).toBe(listItem)
    expect(typeof card.image).toBe('string')
    expect(typeof card.link).toBe('string')
    expect(typeof card.buttonText).toBe('string')
  })

  it('matches the snapshot of a sample CardProps object', () => {
    const sample: CardProps = {
      title: 'Snapshot Title',
      description: 'Snapshot Description',
      listItems: [
        {
          text: 'Item',
          href: '/item',
          role: 'Role',
          detailedDescription: 'Desc',
        },
      ],
      image: '/img.png',
      link: '/link',
    }
    expect(sample).toMatchSnapshot()
  })
})
