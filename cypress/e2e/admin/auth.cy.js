describe('Admin Platform Authentication & RBAC', () => {
  beforeEach(() => {
    // Intercept default API calls that layout might make
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] }).as('getNotifications');
  });

  it('redirects students away from admin dashboard', () => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'M123', name: 'Student', role: 'student' } }).as('getMe');
    
    cy.visit('/admin');
    cy.wait('@getMe');

    // Students should be kicked back to the main user dashboard (/)
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('allows operators to view dashboard but hides admin management tab', () => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'OP1', name: 'Operator', role: 'operator' } }).as('getMeOp');
    cy.intercept('GET', '/api/admin/stats', { statusCode: 200, body: { totalClasses: 1, activeOffers: 0, totalStudents: 0 } }).as('getStats');
    cy.intercept('GET', '/api/admin/logs', { statusCode: 200, body: [] }).as('getLogs');
    
    cy.visit('/admin');
    cy.wait(['@getMeOp', '@getStats', '@getLogs']);

    cy.url().should('include', '/admin');
    
    // Sidebar should NOT contain Manajemen Admin
    cy.contains('Manajemen Admin').should('not.exist');
  });

  it('allows super admins to see admin management tab', () => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'SA1', name: 'SuperAdmin', role: 'super_admin' } }).as('getMeSA');
    cy.intercept('GET', '/api/admin/stats', { statusCode: 200, body: { totalClasses: 1, activeOffers: 0, totalStudents: 0 } }).as('getStats');
    cy.intercept('GET', '/api/admin/logs', { statusCode: 200, body: [] }).as('getLogs');
    
    cy.visit('/admin');
    cy.wait(['@getMeSA', '@getStats', '@getLogs']);

    // Sidebar SHOULD contain Manajemen Admin
    cy.contains('Manajemen Admin').should('be.visible');
  });

  it('redirects operators who try to force navigate to /admin/management', () => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'OP1', name: 'Operator', role: 'operator' } }).as('getMeOp');
    
    cy.visit('/admin/management');
    cy.wait('@getMeOp');

    // Should kick them back to /admin
    cy.url().should('eq', Cypress.config().baseUrl + '/admin');
  });
});
