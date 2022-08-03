// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { faker } from "@faker-js/faker";

Cypress.Commands.add("createRecommendation", (name) => {
    if (!name) {
        name = faker.lorem.words(4);
    }
    cy.visit("");
    cy.log("Comando deve ser chamado");
    cy.get("#song-name").type(name);
    cy.get("#song-link").type("https://www.youtube.com/watch?v=Mi6dx4nHdL4");
    cy.intercept("POST", "/recommendations").as("postRecommendation");
    cy.get("button#action-button").click();
    cy.wait("@postRecommendation");
    cy.contains(name).should("be.visible");
});

Cypress.Commands.add("cleanDb", () => {
    cy.request(
        "DELETE",
        "http://localhost:5000/recommendations/reset",
        {}
    ).then(() => {
        cy.log("Itens apagados com sucesso");
    });
});
