describe('Super Admin Management', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'SA1', name: 'SuperAdmin', role: 'super_admin' } }).as('getMe');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/admin/stats', { statusCode: 200, body: { totalClasses: 0, activeOffers: 0, totalStudents: 0, totalEnrollments: 0, onlineCount: 0 } });
    cy.intercept('GET', '/api/admin/logs', { statusCode: 200, body: [] });

    cy.intercept('GET', '/api/admin/admins', {
      statusCode: 200,
      body: [
        { nim: 'SA1', name: 'SuperAdmin', email: 'sa1@ipb.ac.id', role: 'super_admin', isActive: true },
        { nim: 'OP1', name: 'Operator 1', email: 'op1@ipb.ac.id', role: 'operator', isActive: true },
      ]
    }).as('getAdmins');

    cy.intercept('GET', '/api/admin/me', { statusCode: 200, body: { nim: 'SA1', name: 'SuperAdmin', role: 'super_admin' } }).as('getAdminMe');

    cy.visit('/admin/management');
    cy.wait(['@getMe', '@getAdmins']);
  });

  it('renders admin table correctly', () => {
    cy.get('table').find('tbody tr').should('have.length', 2);
    cy.contains('SuperAdmin').should('be.visible');
    cy.contains('sa1@ipb.ac.id').should('be.visible');
    cy.contains('Super Admin').should('be.visible');

    cy.contains('Operator 1').should('be.visible');
    cy.contains('Operator').should('be.visible');
  });

  it('filters admins client-side by name', () => {
    // Search for the operator's specific name
    cy.get('input[placeholder="SEARCH BY NAME OR EMAIL..."]').type('Operator 1');
    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('Operator 1').should('be.visible');
    // SuperAdmin does not match "Operator 1"
    cy.get('table tbody tr').first().should('contain.text', 'Operator 1');
  });

  it('filters admins client-side by email', () => {
    cy.get('input[placeholder="SEARCH BY NAME OR EMAIL..."]').type('sa1@');
    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('SuperAdmin').should('be.visible');
  });

  it('opens Add Admin modal with correct form fields', () => {
    cy.contains('button', 'Add Admin').click();

    cy.contains('Registrasi Admin').should('be.visible');
    cy.get('input[placeholder="Masukkan nama lengkap..."]').should('be.visible');
    cy.get('input[placeholder="contoh@apps.ipb.ac.id"]').should('be.visible');
    // Shadcn Select trigger
    cy.get('[role="combobox"]').should('be.visible');
  });

  it('submits Add Admin form and calls API with correct role', () => {
    cy.intercept('POST', '/api/admin/admins', { statusCode: 201, body: { nim: 'OP2' } }).as('createAdmin');

    cy.contains('button', 'Add Admin').click();
    cy.get('input[placeholder="Masukkan nama lengkap..."]').type('New Operator');
    cy.get('input[placeholder="contoh@apps.ipb.ac.id"]').type('newop@ipb.ac.id');

    // Default role is "operator" so no need to change select for this test
    cy.contains('button', 'Daftarkan Admin').click();

    cy.wait('@createAdmin').its('request.body').should('deep.equal', {
      name: 'New Operator',
      email: 'newop@ipb.ac.id',
      role: 'operator'
    });
  });

  it('opens Add Admin modal and can change role via Shadcn Select', () => {
    cy.contains('button', 'Add Admin').click();

    // Radix Select: click trigger, then click option
    cy.get('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Super Admin (Full Access)').click();

    // Verify the trigger now shows the selected value
    cy.get('[role="combobox"]').should('contain.text', 'Super Admin');
  });

  it('cancels Add Admin modal on Batal click', () => {
    cy.contains('button', 'Add Admin').click();
    cy.contains('Registrasi Admin').should('be.visible');

    cy.contains('button', 'Batal').click();
    cy.contains('Registrasi Admin').should('not.exist');
  });

  it('opens Edit Admin modal for a non-self admin', () => {
    // Second row is OP1. There are 3 buttons per row: toggle, edit, delete.
    // Edit button is the second button (index 1) after the toggle
    cy.get('table tbody tr').eq(1).find('button').eq(1).click();

    cy.contains('Edit Admin').should('be.visible');
    // Email is read-only in edit modal
    cy.get('input[value="op1@ipb.ac.id"]').should('be.disabled');
  });

  it('updates admin role via Edit Admin modal', () => {
    cy.intercept('PUT', '/api/admin/admins/OP1', { statusCode: 200, body: {} }).as('updateAdmin');

    cy.get('table tbody tr').eq(1).find('button').eq(1).click();
    cy.contains('Edit Admin').should('be.visible');

    // Change role to super_admin
    cy.get('[role="combobox"]').click();
    cy.get('[role="option"]').contains('Super Admin (Full Access)').click();

    cy.contains('button', 'Update Admin').click();

    cy.wait('@updateAdmin').its('request.body').should('include', {
      role: 'super_admin'
    });
  });

  it('deletes admin via window.confirm native dialog', () => {
    cy.intercept('DELETE', '/api/admin/admins/OP1', { statusCode: 200, body: {} }).as('deleteAdmin');

    // Override window.confirm to auto-accept
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });

    // Click delete button on second row (OP1)
    cy.get('table tbody tr').eq(1).find('button').last().click();

    cy.wait('@deleteAdmin');
  });

  it('does not delete when window.confirm is cancelled', () => {
    let deleteWasCalled = false;

    cy.intercept('DELETE', '/api/admin/admins/OP1', (req) => {
      deleteWasCalled = true;
      req.reply({ statusCode: 200, body: {} });
    }).as('deleteAdmin');

    // Reject the confirm dialog
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false);
    });

    cy.get('table tbody tr').eq(1).find('button').last().click();

    // Wait a moment to ensure no async call was made, then verify
    cy.wait(500);
    cy.wrap(deleteWasCalled).should('eq', false);
  });
});
