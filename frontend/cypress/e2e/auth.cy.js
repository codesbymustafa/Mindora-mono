// End-to-end auth journey: a real browser registers a new account,
// then logs in with it, exactly as a user would.
// Requires the full stack running: backend (:3000) + frontend (:5173).

describe("Auth journey", () => {
    it("registers a new user and logs in", () => {
        cy.uniqueSuffix().then((suffix) => {
            const user = {
                fullName: "Cypress Tester",
                username: `cypress_${suffix}`,
                email: `cypress_${suffix}@example.com`,
                password: "password123",
            };

            // --- Register ---
            cy.visit("/register");
            cy.get('input[name="fullName"]').type(user.fullName);
            cy.get('input[name="username"]').type(user.username);
            cy.get('input[name="email"]').type(user.email);
            cy.get('input[name="password"]').type(user.password);
            cy.get('input[name="confirmPassword"]').type(user.password);
            cy.get('input[name="avatar"]').selectFile("cypress/fixtures/avatar.jpg");
            cy.contains("button", "Create Account").click();

            // On success the app redirects to /login.
            cy.url({ timeout: 20000 }).should("include", "/login");

            // --- Login ---
            cy.get('input[placeholder="Enter your username or email"]').type(user.username);
            cy.get('input[placeholder="Enter your password"]').type(user.password);
            cy.contains("button", "Sign in").click();

            // Logged in: redirected off /login and a token is stored.
            cy.url({ timeout: 20000 }).should("not.include", "/login");
            cy.window().its("localStorage.accessToken").should("be.a", "string");
        });
    });

    it("rejects login with wrong credentials", () => {
        cy.visit("/login");
        cy.get('input[placeholder="Enter your username or email"]').type("nobody_here");
        cy.get('input[placeholder="Enter your password"]').type("wrongpassword");
        cy.contains("button", "Sign in").click();

        // Stays on the login page and shows an error.
        cy.url().should("include", "/login");
        cy.contains(/invalid credentials|not found|incorrect/i).should("be.visible");
    });
});
