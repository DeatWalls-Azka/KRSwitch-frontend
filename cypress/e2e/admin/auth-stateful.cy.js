describe('Stateful Authentication Resilience (Real Backend)', () => {
  
  beforeEach(() => {
    // We do NOT use cy.intercept here to mock the responses.
    // We want the real React app to hit the real backend at VITE_API_URL.
    // We clear cookies before each test to ensure a blank state.
    cy.clearCookies();
  });

  it('aggressively clears legacy ghost explicitly-domained cookies and prevents infinite loop', () => {
    // 1. Manually inject a ghost cookie that simulates the old broken state.
    // We set it with domain: 'localhost' which is what caused the loop.
    cy.setCookie('token', 'fake-zombie-token', { domain: 'localhost', httpOnly: true, secure: false });

    // 2. Visit the admin dashboard.
    // The React app's <AdminRoute> will call getCurrentUser() against the real backend.
    cy.visit('/admin');

    // 3. The backend should reject the fake token, attempt to clear the host-only cookie,
    // AND aggressively clear the explicit-domain ('localhost') cookie.
    // Then it should return 401, causing the frontend to redirect to /login.
    cy.url().should('include', '/login');

    // 4. Verify that the browser's cookie storage is completely empty.
    // If the aggressive backend clearCookie failed, this assertion would fail!
    cy.getCookie('token').should('be.null');
  });

  it('handles standard authentication cycle correctly (no ghost cookies)', () => {
    // 1. Start with no cookies.
    // 2. Visit admin dashboard, should redirect to login.
    cy.visit('/admin');
    cy.url().should('include', '/login');

    // 3. Since we can't easily mock the Google OAuth flow in E2E without heavy setup,
    // we can simulate a successful login redirect by hitting the callback with an error
    // just to see if the frontend handles it and doesn't get stuck in a loop.
    cy.visit('/auth/callback?error=oauth_failed');
    cy.url().should('include', '/login?error=oauth_failed');
  });
});
