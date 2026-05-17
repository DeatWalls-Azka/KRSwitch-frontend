describe('Admin Dashboard Operations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'OP1', name: 'Operator', role: 'operator' } }).as('getMe');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/admin/master-files', { statusCode: 200, body: { students: true, classes: true } }).as('getMasterFiles');

    cy.intercept('GET', '/api/admin/stats', {
      statusCode: 200,
      body: { totalClasses: 5, activeOffers: 12, totalStudents: 350, totalEnrollments: 200, onlineCount: 3 }
    }).as('getStats');

    cy.intercept('GET', '/api/admin/logs', {
      statusCode: 200,
      body: [
        { id: 1, timestamp: new Date().toISOString(), user_nim: 'OP1', action_type: 'LOGIN', details: 'User logged in' },
        { id: 2, timestamp: new Date().toISOString(), user_nim: 'SA1', action_type: 'UPDATE_SYSTEM', details: 'Updated system settings' }
      ]
    }).as('getLogs');

    cy.visit('/admin');
    cy.wait(['@getMe', '@getStats', '@getLogs']);
  });

  it('renders statistics cards correctly', () => {
    cy.contains('350').should('be.visible'); // Total Students
    cy.contains('12').should('be.visible');  // Active Offers
    cy.contains('5').should('be.visible');   // Total Classes
  });

  it('renders audit logs table with correct row count', () => {
    cy.get('table').find('tbody tr').should('have.length', 2);
    cy.contains('User logged in').should('be.visible');
    cy.contains('Updated system settings').should('be.visible');
  });

  it('filters audit logs by action type via search', () => {
    cy.get('input[placeholder="SEARCH AUDIT TRAIL..."]').type('LOGIN');

    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('User logged in').should('be.visible');
    cy.contains('Updated system settings').should('not.exist');
  });

  it('filters audit logs by user NIM via search', () => {
    cy.get('input[placeholder="SEARCH AUDIT TRAIL..."]').type('SA1');

    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('Updated system settings').should('be.visible');
  });

  it('clears search filter when X button is clicked', () => {
    cy.get('input[placeholder="SEARCH AUDIT TRAIL..."]').type('LOGIN');
    cy.get('table').find('tbody tr').should('have.length', 1);

    // Click the X clear button
    cy.get('input[placeholder="SEARCH AUDIT TRAIL..."]').siblings('button').click();
    cy.get('table').find('tbody tr').should('have.length', 2);
  });

  it('shows Re-randomize Data button in System Operational state when enrollments exist', () => {
    // Navigate to step 1 via the step button
    cy.contains('button', 'Step 2').click();

    cy.contains('button', 'Re-randomize Data').should('be.visible');
  });

  it('calls seed-random API when Re-randomize Data is clicked', () => {
    cy.intercept('POST', '/api/admin/seed-random', { statusCode: 200, body: { message: 'Success' } }).as('seedRandom');

    cy.contains('button', 'Step 2').click();
    cy.contains('button', 'Re-randomize Data').click();

    cy.wait('@seedRandom');
  });
});
