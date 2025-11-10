/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { waitlist } from './app.po';

type WaitlistResponseBody = {
  status: 'success' | 'error';
  message?: string;
};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<Subject>;
      stubWaitlist(
        statusCode?: number,
        body?: WaitlistResponseBody,
        aliasName?: string
      ): Chainable<Subject>;
      submitWaitlist(email: string, aliasName?: string): Chainable<Subject>;
    }
  }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add(
  'stubWaitlist',
  (statusCode = 200, body: WaitlistResponseBody = { status: 'success' }, aliasName = 'waitlist') => {
    cy.intercept('POST', '/api/V1/waitlist', {
      statusCode,
      body,
    }).as(aliasName);
  }
);

Cypress.Commands.add('submitWaitlist', (email: string, aliasName = 'waitlist') => {
  waitlist.emailInput().clear().type(email);
  waitlist.submitButton().should('not.be.disabled').click();
  cy.wait(`@${aliasName}`);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
