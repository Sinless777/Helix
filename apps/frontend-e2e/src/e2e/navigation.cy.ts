import { headerNav, navPages } from '../support/app.po';

const routablePages = navPages.filter((page) =>
  ['/', '/About', '/Contact', '/technology'].includes(page.url)
);

describe('Header navigation', () => {
  it('lists every configured navigation link on desktop viewports', () => {
    cy.viewport(1280, 800);
    cy.visit('/');

    navPages.forEach((page) => {
      headerNav.desktopButton(page.name).should('be.visible');
    });
  });

  it('navigates between each primary route on desktop', () => {
    cy.viewport(1400, 900);
    cy.visit('/');

    routablePages.forEach((page) => {
      headerNav.desktopButton(page.name).click();
      cy.location('pathname').should('eq', page.url);

      if (page.url === '/') {
        cy.contains('Meet Helix AI').should('be.visible');
      } else if (page.url === '/About') {
        cy.contains('About Helix AI').should('be.visible');
      } else if (page.url === '/Contact') {
        cy.contains('Contact Us').should('be.visible');
      } else if (page.url === '/technology') {
        cy.contains('Technology').should('be.visible');
      }
    });
  });

  it('supports navigation via the mobile drawer', () => {
    cy.viewport('iphone-6');
    cy.visit('/');

    headerNav.mobileToggle().click();
    headerNav.mobileItem('Contact').click();

    cy.location('pathname').should('eq', '/Contact');
    cy.contains('Contact Us').should('be.visible');
  });
});
