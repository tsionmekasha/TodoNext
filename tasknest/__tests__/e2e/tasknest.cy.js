describe('TaskNest E2E', () => {
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';
  const newName = 'Updated Name';
  const todoTitle = 'My First Todo';
  const updatedTodoTitle = 'My Updated Todo';


  it('should allow a user to signup, login, CRUD todos, update profile, and logout', () => {
    // Home page
    cy.visit('/');
    cy.contains('Welcome').should('exist');
    cy.contains('Get Started Now').click();


    // Signup page
    cy.url().should('include', '/signup');
    cy.contains('label', 'Name').parent().find('input').type('Test User');
    cy.contains('label', 'Email Address').parent().find('input').type(email);
    cy.contains('label', 'Password').parent().find('input').type(password);
    cy.get('button[type="submit"]').click();


    // Should redirect to login
    cy.url({ timeout: 20000 }).should('include', '/login');
    cy.contains('label', 'Email Address').parent().find('input').type(email);
    cy.contains('label', 'Password').parent().find('input').type(password);
    cy.wait(300);


    cy.get('button[type="submit"]').click();


    // Dashboard
    cy.contains('Welcome Back!').should('exist');
    // Add a todo
    cy.get('input[placeholder="Add a new task..."]').type(todoTitle);
    cy.get('button[type="submit"]').click();
    cy.contains(todoTitle).should('exist');


    // Edit the todo


    // Edit the todo
    cy.get('button[aria-label="edit"]').first().click();
    cy.get(`input[value=\"${todoTitle}\"]`).clear().type(updatedTodoTitle);
    cy.get('button[aria-label="save"]').click();
    cy.contains(updatedTodoTitle).should('exist');


    // Delete the todo


    cy.contains(updatedTodoTitle)
    cy.get('button[aria-label="delete"]').first().click();
    // Confirm deletion in dialog
    cy.get('button').contains(/^Delete$/).click();
    cy.contains(updatedTodoTitle).should('not.exist');


    // Go to profile page
    // Open user menu and go to profile
    cy.get('button[aria-label="account of current user"]').click();
    cy.get('li').contains(/^Profile$/).click();
    cy.url().should('include', '/profile');
    cy.get('button[aria-label="Edit Name"]').click();
    cy.wait(300);
    cy.wait(300);
    cy.get(`input[value="${name}"]`)
    .invoke('val', '')
    .trigger('input')
    .type(newName);    
    cy.get('button[aria-label="Save Name"]').click();
    cy.contains(newName).should('exist');
    // Change password
    cy.get('button').contains(/change password/i).click();
    cy.get('input[type="password"]').eq(0).type(password); // current password
    cy.get('input[type="password"]').eq(1).type('newPassword123'); // new password
    cy.get('button').contains(/^Save$/).click();
    cy.contains('Password changed successfully!').should('exist');
    // Go back to dashboard
    cy.get('button').contains(/back to dashboard/i).click();
    cy.url().should('include', '/dashboard');


    // Logout from navbar
    cy.get('button[aria-label="account of current user"]').click();
    cy.get('li').contains(/logout/i).click();
    cy.url().should('include', '/login');
  });
});
