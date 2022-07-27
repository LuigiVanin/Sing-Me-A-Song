import supertest from "supertest";
import app from "../src/app";
import { prisma } from "../src/database";
import RecomendationFactory from "./factories/recomendation.factory";

describe("teste de recomendação", () => {
    const agent = supertest(app);

    beforeAll(async () => {
        await prisma.recommendation.deleteMany();
    });

    afterAll(async () => {
        await prisma.recommendation.deleteMany();
        await prisma.$disconnect();
    });

    it("teste de criação de um nova música - 201", async () => {
        const factory = new RecomendationFactory();
        const data = factory.generateVideoData("youtube");

        const response = await agent.post("/recommendations").send(data);

        expect(response.statusCode).toBe(201);

        const result = await factory.inspectResult(data.name);

        expect(result.name).toBe(data.name);
        expect(result.score).toBe(0);
    });

    it("teste de falha de criação de nova música, tentando adicionar uma música que já existe - 409", async () => {
        const factory = new RecomendationFactory();
        const data = await factory.createVideo();

        const result = await factory.inspectResult(data.name);
        console.log(result);
        const response = await agent.post("/recommendations").send(data);

        expect(response.statusCode).toBe(409);
    });

    it("teste de falha link que não corresponde com youtube - 422", async () => {
        const factory = new RecomendationFactory();
        const data = factory.generateVideoData("any");

        const response = await agent.post("/recommendations").send(data);

        expect(response.statusCode).toBe(422);
    });

    it("teste de upvote em um vídeo, deve ser sucesso - 201", async () => {
        const factory = new RecomendationFactory();
        const { name } = await factory.createVideo();
        let video = await factory.inspectResult(name);

        expect(video.score).toBe(0);

        const response = await agent.post(
            `/recommendations/${video.id}/upvote`
        );
        expect(response.statusCode).toBe(200);

        video = await factory.inspectResult(name);

        expect(video.score).toBe(1);
    });
});
