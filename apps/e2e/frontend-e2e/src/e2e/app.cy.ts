import { heroSection, waitlist } from '../support/app.po';

describe('Home page experience', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('renders the development banner, hero, and skip link', () => {
    heroSection.skipLink().should('exist');
    heroSection.mainContent().should('exist');
    heroSection.heading().should('be.visible');
    heroSection.subtitle().should('be.visible');
    cy.contains('Under Development').should('be.visible');
    cy.contains('This is a development environment. Features may be incomplete.').should(
      'be.visible'
    );
  });

  it('allows keyboard users to jump directly to the main content', () => {
    heroSection.skipLink().click({ force: true });
    cy.location('hash').should('eq', '#main-content');
  });

  it('validates the waitlist form before submitting', () => {
    waitlist.submitButton().should('be.disabled');
    waitlist.emailInput().type('invalid-email');
    waitlist.submitButton().should('be.disabled');
    waitlist.form().contains('Please enter a valid email').should('be.visible');

    waitlist.emailInput().clear().type('user@example.com');
    waitlist.submitButton().should('be.enabled');
  });

  it('submits the waitlist form successfully', () => {
    cy.stubWaitlist(200, { status: 'success' }, 'waitlistSuccess');
    cy.submitWaitlist('success@example.com', 'waitlistSuccess');

    waitlist.successAlert().should('be.visible');
    waitlist.emailInput().should('have.value', '');
  });

  it('shows an error message when the waitlist submission fails', () => {
    cy.stubWaitlist(500, { status: 'error', message: 'Server unavailable' }, 'waitlistError');
    cy.submitWaitlist('failure@example.com', 'waitlistError');

    waitlist.errorAlert().should('contain.text', 'Server unavailable');
    waitlist.submitButton().should('be.enabled');
  });
});
