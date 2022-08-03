const { faker } = require("@faker-js/faker");

describe("empty spec", () => {
    beforeEach(() => {
        cy.cleanDb();
    });

    afterEach(() => {
        cy.cleanDb();
    });

    it("passes", () => {
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
