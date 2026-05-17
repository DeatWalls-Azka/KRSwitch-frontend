describe('Redirect Loop Guard', () => {
  beforeEach(() => {
    // Clear storage before starting
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('detects a rapid auth redirect loop, halts navigation, and renders the premium recovery dashboard', () => {
    // Intercept /api/me to return 401 Unauthorized
    cy.intercept('GET', '**/api/me', {
      statusCode: 401,
      body: { error: 'Not authenticated' }
    }).as('getCurrentUser');

    // Visit the home route. Since it's protected, it will try to hit /api/me, fail, and redirect to /login
    cy.visit('/', { failOnStatusCode: false });

    // Simulate multiple rapid path changes between '/' and '/login' in the guard history
    cy.window().then((win) => {
      const now = Date.now();
      const history = [
        { path: '/login', time: now - 3000 },
        { path: '/', time: now - 2500 },
        { path: '/login', time: now - 2000 },
        { path: '/', time: now - 1500 },
        { path: '/login', time: now - 1000 },
        { path: '/', time: now - 500 }
      ];
      win.sessionStorage.setItem('auth_redirect_history', JSON.stringify(history));
    });

    // Navigate to trigger route evaluation
    cy.visit('/login');

    // The guard should now find more than 2 login and 2 main paths in 5 seconds and halt execution
    // Verify that the stylized System Recovery dashboard is shown
    cy.contains('LOOP AUTENTIKASI DIHENTIKAN').should('be.visible');
    cy.contains('Sistem mendeteksi adanya perulangan autentikasi beruntun').should('be.visible');
    cy.contains('BERSIHKAN SESI & LOGIN ULANG').should('be.visible');

    // Intercept standard logout requests
    cy.intercept('POST', '**/auth/logout', {
      statusCode: 200,
      body: { message: 'Logged out' }
    }).as('logoutCall');

    // Click the force-reset recovery button
    cy.contains('button', 'BERSIHKAN SESI & LOGIN ULANG').click();

    // Verify localStorage and sessionStorage are purged
    cy.window().then((win) => {
      expect(win.localStorage.length).to.equal(0);
      expect(win.sessionStorage.length).to.equal(0);
    });
  });
});
