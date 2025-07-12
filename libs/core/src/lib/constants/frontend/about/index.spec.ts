import React from 'react';
import { render } from '@testing-library/react';
import { AboutContent, AboutSection } from './index';

describe('AboutContent constants', () => {
  it('should be an array of AboutSection objects', () => {
    expect(Array.isArray(AboutContent)).toBe(true);
    AboutContent.forEach((section: AboutSection) => {
      expect(section).toHaveProperty('title');
      expect(typeof section.title).toBe('string');
      expect(section).toHaveProperty('content');
      expect(React.isValidElement(section.content)).toBe(true);
      if (section.icon !== undefined) {
        expect(typeof section.icon).toBe('string');
      }
    });
  });

  it('should contain the correct number of sections', () => {
    expect(AboutContent).toHaveLength(4);
  });

  it('renders each section content with at least one paragraph', () => {
    AboutContent.forEach((section: AboutSection) => {
      const { container } = render(section.content);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(0);
    });
  });

  it('matches the rendered content snapshot', () => {
    AboutContent.forEach((section: AboutSection, index: number) => {
      const { asFragment } = render(section.content);
      expect(asFragment()).toMatchSnapshot(`AboutContent-${index}`);
    });
  });
});
