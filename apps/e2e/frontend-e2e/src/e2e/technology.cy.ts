import { helixCards, technologyCardsSortedByTitle } from '../support/app.po';

import { AIToolsCards } from '../../../frontend/src/content/technology/AI';
import { CloudPlatformCards } from '../../../frontend/src/content/technology/cloud-platforms';

describe('Technology page', () => {
  beforeEach(() => {
    cy.visit('/technology');
  });

  it('renders each technology card in alphabetical order', () => {
    helixCards.all().should('have.length', technologyCardsSortedByTitle.length);

    helixCards
      .all()
      .then(($cards) =>
        Array.from($cards, (card) => card.getAttribute('data-card-title') ?? '')
      )
      .should('deep.equal', technologyCardsSortedByTitle.map((card) => card.title));
  });

  it('lists every AI & ML tool with outbound links', () => {
    helixCards
      .byTitle(AIToolsCards.title)
      .should('exist')
      .within(() => {
        cy.get('li').should('have.length', AIToolsCards.listItems.length);

        AIToolsCards.listItems.forEach((item) => {
          cy.contains('a', item.text)
            .should('have.attr', 'href', item.href)
            .and('have.attr', 'target', '_blank');
        });
      });
  });

  it('renders CTA buttons for cards configured with internal links', () => {
    const cloudCard = CloudPlatformCards[0];

    helixCards
      .byTitle(cloudCard.title)
      .should('exist')
      .within(() => {
        cy.contains('a', cloudCard.buttonText ?? 'Explore')
          .should('have.attr', 'href', cloudCard.link)
          .and('not.have.attr', 'target');
      });
  });
});
