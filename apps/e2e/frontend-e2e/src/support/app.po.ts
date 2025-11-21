import type { CardProps } from '@helix-ai/ui';

import { headerProps } from '../../../frontend/src/content/header';
import { AboutContent } from '../../../frontend/src/content/about';
import { CONTACT_OPTIONS } from '../../../frontend/src/content/contact';
import * as technologyContent from '../../../frontend/src/content/technology';

const isCard = (value: unknown): value is CardProps =>
  typeof value === 'object' && value !== null && 'title' in (value as Record<string, unknown>);

const normalizeCardValue = (value: unknown): CardProps[] => {
  if (Array.isArray(value)) {
    return value.filter(isCard);
  }

  return isCard(value) ? [value] : [];
};

export const navPages = headerProps.pages ?? [];
export const aboutSections = AboutContent;
export const contactOptions = CONTACT_OPTIONS;
export const technologyCards: CardProps[] = Object.values(technologyContent).flatMap(
  normalizeCardValue
);
export const technologyCardsSortedByTitle = [...technologyCards].sort((a, b) =>
  a.title.localeCompare(b.title)
);

export const heroSection = {
  skipLink: () => cy.contains('a', 'Skip to content'),
  mainContent: () => cy.get('#main-content'),
  heading: () => cy.contains('h1', 'Meet Helix AI'),
  subtitle: () =>
    cy.contains(
      'Seamlessly connect, automate, and analyze with an AI assistant built to simplify tasks'
    ),
};

export const waitlist = {
  section: () => cy.get('[data-testid="waitlist-section"]'),
  form: () => cy.get('[data-testid="waitlist-form"]'),
  emailInput: () => cy.get('[data-testid="waitlist-email-input"]'),
  submitButton: () => cy.get('[data-testid="waitlist-submit"]'),
  successAlert: () => cy.get('[data-testid="waitlist-success"]'),
  errorAlert: () => cy.get('[data-testid="waitlist-error"]'),
};

export const headerNav = {
  desktopButton: (label: string) => cy.contains('header button', label),
  mobileToggle: () => cy.get('button[aria-label="Open menu"]'),
  mobileItem: (label: string) => cy.contains('div[role="button"]', label),
};

export const helixCards = {
  all: () => cy.get('[data-testid="helix-card"]'),
  byTitle: (title: string) => cy.get(`[data-card-title="${title}"]`),
};
