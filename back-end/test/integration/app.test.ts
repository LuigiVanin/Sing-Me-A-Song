import supertest from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/database";
import RecomendationFactory from "../factories/recomendation.factory";
import { faker } from "@faker-js/faker";

describe("Recomendation ⟷  Integration Test", () => {
    const agent = supertest(app);

    beforeAll(async () => {
        await prisma.recommendation.deleteMany();
    });

    afterAll(async () => {
        await prisma.recommendation.deleteMany();
        await prisma.$disconnect();
    });

    describe("➔ Testing Creating recommendations", () => {
        it("Creating a new recommendation with sucess - 201", async () => {
            const factory = new RecomendationFactory();
            const data = factory.generateVideoData("youtube");

            const response = await agent.post("/recommendations").send(data);

            expect(response.statusCode).toBe(201);

            const result = await factory.inspectResult(data.name);

            expect(result.name).toBe(data.name);
            expect(result.score).toBe(0);
        });

        it("Fail on creating new music recommendation - should 409 with conflict", async () => {
            const factory = new RecomendationFactory();
            const data = await factory.createVideo();

            const response = await agent.post("/recommendations").send(data);

            expect(response.statusCode).toBe(409);

            const result = await factory.inspectResult(data.name);

            expect(result.name).toEqual(data.name);
        });

        it("Testing the creation of a recomendation thats isnt from youtube - should 422", async () => {
            const factory = new RecomendationFactory();
            const data = factory.generateVideoData("any");

            const response = await agent.post("/recommendations").send(data);

            expect(response.statusCode).toBe(422);
        });
    });

    describe("➔ Testing recommendation score and rating - upvoting and downvoting", () => {
        it("Test on upvoting a recommendation - should 200", async () => {
            const factory = new RecomendationFactory();
            const { name } = await factory.createVideo(233);
            let video = await factory.inspectResult(name);

            expect(video.score).toBe(233);

            const response = await agent.post(
                `/recommendations/${video.id}/upvote`
            );
            expect(response.statusCode).toBe(200);

            video = await factory.inspectResult(name);

            expect(video.score).toBe(234);
        });

        it("Test on downvoting a recommendation - should 200", async () => {
            const factory = new RecomendationFactory();
            const { name } = await factory.createVideo(10);

            let video = await factory.inspectResult(name);

            expect(video.score).toEqual(10);

            const response = await agent.post(
                `/recommendations/${video.id}/downvote`
            );
            expect(response.statusCode).toBe(200);

            video = await factory.inspectResult(name);

            expect(video.score).toEqual(9);
        });

        it("Downvoting invalid id - should throw 404", async () => {
            const randomId = faker.random.numeric(5);
            const response = await agent.post(
                `/recommendations/${randomId}/downvote`
            );
            expect(response.statusCode).toBe(404);
        });

        it("Downvoting a recommendation below -5 - should delete item return 200", async () => {
            const factory = new RecomendationFactory();
            const { name } = await factory.createVideo(-5);
            let video = await factory.inspectResult(name);

            const response = await agent.post(
                `/recommendations/${video.id}/downvote`
            );

            expect(response.statusCode).toBe(200);

            video = await factory.inspectResult(name);

            expect(video).toBeNull();
        });
    });

    describe("➔ Testing get methods of the recommendation api", () => {
        it("Get all recommendation - must be 200 ", async () => {
            const response = await agent.get(`/recommendations/`);
            expect(response.status).toBe(200);
            for (const item of response.body) {
                expect(item).not.toBeNull();
            }
        });

        it("Get recommendation by existing id - should 200", async () => {
            const factory = new RecomendationFactory();
            const { name } = await factory.createVideo();

            let video = await factory.inspectResult(name);

            console.log(video);

            const response = await agent.get(`/recommendations/${video.id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toMatchObject(video);
        });

        it("Trying to get invalid id recomendation - should throw 404", async () => {
            const randomId = faker.random.numeric(5);
            const response = await agent.get(`/recommendations/${randomId}`);
            expect(response.statusCode).toBe(404);
        });
    });
});
