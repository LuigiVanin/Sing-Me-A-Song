/// <reference types="cypress" />

const { faker } = require("@faker-js/faker");

describe("Testing upvoting feature", () => {
    beforeEach(() => {
        cy.cleanDb();
    });

    afterEach(() => {
        cy.cleanDb();
    });

    it("Should successfully upvote a recommendation", () => {
        const recommendationName = faker.lorem.words(3);
        cy.createRecommendation(recommendationName);
        cy.intercept({
            method: "POST",
            url: "http://localhost:5000/recommendations/*/upvote",
        }).as("upvote");
        cy.contains(recommendationName).get(".upvote-button").click();
        cy.wait("@upvote");
        cy.get(".upvote-button").should("exist");
    });
});
