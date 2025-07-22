describe('Login Page', () => {
  it('logs in a user successfully', () => {
    cy.visit('/login');

    cy.findByLabelText(/email address/i).type('testuser@gmail.com');
    cy.findByLabelText(/password/i).type('123456');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains(/welcome/i);
  });
});
