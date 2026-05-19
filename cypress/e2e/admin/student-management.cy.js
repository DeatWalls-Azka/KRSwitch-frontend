describe('Admin Student Management', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/me', { statusCode: 200, body: { nim: 'OP1', name: 'Operator', role: 'operator' } }).as('getMe');
    cy.intercept('GET', '/api/notifications', { statusCode: 200, body: [] });
    cy.intercept('GET', '/api/admin/stats', { statusCode: 200, body: { totalClasses: 0, activeOffers: 0, totalStudents: 0, totalEnrollments: 0, onlineCount: 0 } });
    cy.intercept('GET', '/api/admin/logs', { statusCode: 200, body: [] });

    cy.intercept('GET', '/api/admin/users', {
      statusCode: 200,
      body: [
        { nim: 'M0001', name: 'Alice', email: 'alice@ipb.ac.id', enrollmentCount: 1, activeBarterCount: 0 },
        { nim: 'M0002', name: 'Bob', email: 'bob@ipb.ac.id', enrollmentCount: 2, activeBarterCount: 1 },
      ]
    }).as('getUsers');

    cy.visit('/admin/students');
    cy.wait(['@getMe', '@getUsers']);
  });

  it('renders student table with correct rows', () => {
    cy.get('table').find('tbody tr').should('have.length', 2);
    cy.contains('Alice').should('be.visible');
    cy.contains('M0001').should('be.visible');
    cy.contains('M0002').should('be.visible');
  });

  it('filters students client-side by name', () => {
    cy.get('input[placeholder="SEARCH BY NIM OR NAME..."]').type('Bob');
    // Client-side filter — no API call needed
    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('Bob').should('be.visible');
    cy.contains('Alice').should('not.exist');
  });

  it('filters students client-side by NIM', () => {
    cy.get('input[placeholder="SEARCH BY NIM OR NAME..."]').type('M0001');
    cy.get('table').find('tbody tr').should('have.length', 1);
    cy.contains('Alice').should('be.visible');
  });

  it('shows empty state when search yields no results', () => {
    cy.get('input[placeholder="SEARCH BY NIM OR NAME..."]').type('ZZZNOTFOUND');
    cy.contains('No matching records found').should('be.visible');
    cy.get('table').find('tbody tr').should('have.length', 1); // the "no records" tr
  });

  it('opens Add Student modal with correct form fields', () => {
    cy.contains('button', 'ADD MAHASISWA').click();

    // Modal uses h3, not h2
    cy.contains('Registrasi Mahasiswa').should('be.visible');
    cy.get('input[placeholder="G6401211XXX"]').should('be.visible');
    cy.get('input[placeholder="Masukkan nama lengkap..."]').should('be.visible');
  });

  it('submits Add Student modal and calls API', () => {
    cy.intercept('POST', '/api/admin/users', { statusCode: 201, body: { nim: 'M0000000003' } }).as('createUser');

    cy.contains('button', 'ADD MAHASISWA').click();
    cy.get('input[placeholder="G6401211XXX"]').type('M0000000003');
    cy.get('input[placeholder="Masukkan nama lengkap..."]').type('Charlie');
    cy.get('input[placeholder="example@student.itb.ac.id"]').type('charlie@student.itb.ac.id');
    cy.contains('button', 'Daftarkan Mahasiswa').click();

    cy.wait('@createUser').its('request.body').should('deep.include', {
      nim: 'M0000000003',
      name: 'Charlie',
      email: 'charlie@student.itb.ac.id'
    });
  });

  it('closes Add Student modal on Batal click', () => {
    cy.contains('button', 'ADD MAHASISWA').click();
    cy.contains('Registrasi Mahasiswa').should('be.visible');

    cy.contains('button', 'Batal').click();
    cy.contains('Registrasi Mahasiswa').should('not.exist');
  });

  it('opens student detail drawer when row is clicked', () => {
    cy.intercept('GET', '/api/admin/users/M0001', {
      statusCode: 200,
      body: { nim: 'M0001', name: 'Alice', enrollments: [], offeredBarters: [] }
    }).as('getStudentDetail');

    cy.get('table tbody tr').first().click();
    cy.wait('@getStudentDetail');

    // Drawer tabs should appear
    cy.contains('KRS').should('be.visible');
    cy.contains('Barter').should('be.visible');
  });
});
