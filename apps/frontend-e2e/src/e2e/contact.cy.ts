import { contactOptions, helixCards } from '../support/app.po';

describe('Contact page', () => {
  beforeEach(() => {
    cy.visit('/Contact');
  });

  it('shows a card for every contact channel with the correct CTA link', () => {
    helixCards.all().should('have.length', contactOptions.length);

    contactOptions.forEach((option) => {
      helixCards.byTitle(option.title).within(() => {
        cy.contains(option.description.slice(0, 60)).should('exist');
        cy.contains('a', option.buttonText)
          .should('have.attr', 'href', option.link)
          .and('have.attr', 'target', '_blank');
      });
    });
  });
});
