# Testing

## 🧪 Cypress End-to-End Tests

Verify components and access guards using Cypress. Tests require a running database and backend instance to complete OAuth popup verification and route-guard redirections.

```bash
# Start Cypress in interactive UI mode:
npm run cypress:open

# Run Cypress headless:
npm run cypress:run
```

### Test Suites
*   **Auth Checks (`auth.cy.js`)**: Evaluates Google OAuth callback sequences and cookie clearings.
*   **Role Mappings (`redirect-guard.cy.js`)**: Confirms route redirects for unauthorized roles.
