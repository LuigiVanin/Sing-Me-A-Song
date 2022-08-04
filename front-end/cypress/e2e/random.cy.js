/// <reference types="cypress" />

const { faker } = require("@faker-js/faker");

describe("Random feature page tests", () => {
    before(() => {});

    afterEach(() => {
        cy.cleanDb();
    });

    it("Should create a recommendation and go to the /random page", () => {
        const name = faker.lorem.words(4);
        cy.createRecommendation(name);
        cy.visit("/random");
        cy.contains(name).should("exist");
    });
});
