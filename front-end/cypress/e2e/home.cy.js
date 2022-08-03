/// <reference types="cypress" />

describe("Home page tests", () => {
    it("Visiting home page - should not have any recommendation item", () => {
        cy.visit("");
        cy.get(".recommendation-item").should("not.exist");
    });

    it("Will visit the home page and try to create a Recommendation - should be ok", () => {
        cy.createRecommendation();
        cy.get(".recommendation-item").should("exist");
        cy.cleanDb();
    });
});
