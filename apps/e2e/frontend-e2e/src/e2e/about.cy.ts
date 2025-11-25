import { aboutSections, helixCards } from '../support/app.po';

describe('About page', () => {
  beforeEach(() => {
    cy.visit('/About');
  });

  it('renders a Helix card for every configured about section', () => {
    helixCards.all().should('have.length', aboutSections.length);

    aboutSections.forEach((section) => {
      const card = helixCards.byTitle(section.title);

      card.should('be.visible');
      card.within(() => {
        cy.contains(section.title.replace(/^[^A-Z0-9]*/i, '')).should('exist');

        const firstParagraph = section.paragraphs.at(0);
        const lastParagraph = section.paragraphs.at(-1);

        if (firstParagraph) {
          cy.contains(firstParagraph.slice(0, 40)).should('exist');
        }

        if (lastParagraph && lastParagraph !== firstParagraph) {
          cy.contains(lastParagraph.slice(0, 40)).should('exist');
        }
      });
    });
  });
});
