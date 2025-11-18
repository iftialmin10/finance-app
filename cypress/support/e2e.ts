export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      resetDb(): Chainable<void>
    }
  }
}

Cypress.Commands.add('resetDb', () => {
  cy.task('db:reset')
})

beforeEach(() => {
  cy.resetDb()
})

