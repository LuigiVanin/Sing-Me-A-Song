/// <reference types="cypress" />

describe("empty spec", () => {
    before(() => {});

    afterEach(() => {
        cy.cleanDb();
    });

    it("passes", () => {
        cy.visit("");
    });
});
