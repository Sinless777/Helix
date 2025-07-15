import { navSections, NavSection, NavItem } from './navigation'
import MapIcon from '@mui/icons-material/Map'

describe('Navigation configuration', () => {
  it('should be an array of NavSection objects', () => {
    expect(Array.isArray(navSections)).toBe(true)
    navSections.forEach((section: NavSection) => {
      expect(typeof section.id).toBe('string')
      expect(section.id.length).toBeGreaterThan(0)
      expect(typeof section.title).toBe('string')
      expect(section.title.length).toBeGreaterThan(0)
      expect(Array.isArray(section.items)).toBe(true)
    })
  })

  it('should contain the expected number of sections', () => {
    // Expected sections: about, setup, apps, dev-docs, legal, refs
    expect(navSections).toHaveLength(6)
  })

  it('should validate NavItem properties recursively', () => {
    const validateItem = (item: NavItem) => {
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
      expect(typeof item.label).toBe('string')
      expect(item.label.length).toBeGreaterThan(0)
      if (item.href !== undefined) {
        expect(typeof item.href).toBe('string')
        expect(item.href.length).toBeGreaterThan(0)
      }
      if (item.icon !== undefined) {
        // Icon should be a React component type
        expect(item.icon).toBe(MapIcon)
      }
      if (item.external !== undefined) {
        expect(typeof item.external).toBe('boolean')
      }
      if (item.target !== undefined) {
        expect(['_blank', '_self', '_parent', '_top']).toContain(item.target)
      }
      if (item.rel !== undefined) {
        expect(typeof item.rel).toBe('string')
        expect(item.rel.length).toBeGreaterThan(0)
      }
      if (item.disabled !== undefined) {
        expect(typeof item.disabled).toBe('boolean')
      }
      if (item.badge !== undefined) {
        const badge = item.badge
        expect(typeof badge === 'string' || typeof badge === 'number').toBe(
          true
        )
      }
      if (item.items !== undefined) {
        expect(Array.isArray(item.items)).toBe(true)
        item.items.forEach((child) => validateItem(child))
      }
    }

    navSections.forEach((section) => {
      section.items.forEach((item) => validateItem(item))
    })
  })

  it('matches the snapshot of navSections', () => {
    expect(navSections).toMatchSnapshot()
  })
})
