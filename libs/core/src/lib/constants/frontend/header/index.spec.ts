import { headerProps, Page } from './index';
import { pages as homePages } from '../home';

describe('headerProps configuration', () => {
  it('should match the imported pages array', () => {
    expect(headerProps.pages).toBe(homePages);
    expect(Array.isArray(headerProps.pages)).toBe(true);
  });

  it('should conform to HeaderProps interface', () => {
    // Runtime checks for required fields
    expect(typeof headerProps.logo).toBe('string');
    expect(headerProps.logo.length).toBeGreaterThan(0);

    expect(typeof headerProps.title).toBe('string');
    expect(headerProps.title.length).toBeGreaterThan(0);

    expect(typeof headerProps.version).toBe('string');
    expect(headerProps.version).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);

    // Style should be an object containing valid CSS properties
    expect(typeof headerProps.style).toBe('object');
    if (headerProps.style) {
      expect(typeof headerProps.style.padding).toBe('string');
      expect(headerProps.style.padding?.valueOf).toBeGreaterThan(0);
      expect(typeof (headerProps.style as React.CSSProperties).background).toBe('string');
      expect((headerProps.style as React.CSSProperties).background).toMatch(/^linear-gradient\(/);
    }
  });

  it('each page should match the Page interface shape', () => {
    headerProps.pages.forEach((page: Page) => {
      expect(typeof page.name).toBe('string');
      expect(page.name.length).toBeGreaterThan(0);
      expect(typeof page.url).toBe('string');
      expect(page.url.length).toBeGreaterThan(0);
    });
  });

  it('matches the snapshot of headerProps', () => {
    expect(headerProps).toMatchSnapshot();
  });
});
