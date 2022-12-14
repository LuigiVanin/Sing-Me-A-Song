/// <reference types="cypress" />

const { faker } = require("@faker-js/faker");

describe("Top itens page tests", () => {
    before(() => {});

    afterEach(() => {
        cy.cleanDb();
    });

    it("Should create a recommendation and check at /home if it was created and found", () => {
        const name = faker.lorem.words(4);
        cy.createRecommendation(name);
        cy.visit("/top");
        cy.contains(name).should("exist");
    });
});
