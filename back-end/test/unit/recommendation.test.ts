import { recommendationService } from "../../src/services/recommendationsService";
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { faker } from "@faker-js/faker";
import RecomendationFactory from "../factories/recomendation.factory";
import { Recommendation } from "@prisma/client";
import { areScoresOrdered } from "../../src/utils/utils";

jest.mock("../../src/repositories/recommendationRepository");

describe("RecomendationService ⟷  Unit Test", () => {
    const factory = new RecomendationFactory();
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("➔ Testing create recommendation service", () => {
        it("Testing a case where item already exist - should throw error(conflict)", async () => {
            jest.spyOn(
                recommendationRepository,
                "findByName",
            ).mockImplementationOnce(factory.newMockImplementation());
            try {
                await recommendationService.insert(
                    factory.generateVideoData("youtube"),
                );
                fail();
            } catch (err) {
                expect(recommendationRepository.findByName).toBeCalled();
                expect(err.type).toBe("conflict");
            }
        });

        it("Testing a case where all given parameters are correct - should pass without error", async () => {
            jest.spyOn(
                recommendationRepository,
                "findByName",
            ).mockImplementationOnce(() => null);
            jest.spyOn(
                recommendationRepository,
                "create",
            ).mockImplementationOnce(factory.newMockImplementation());
            try {
                await recommendationService.insert(
                    factory.generateVideoData("youtube"),
                );
                expect(recommendationRepository.findByName).toBeCalled();
                expect(recommendationRepository.create).toBeCalled();
            } catch (err) {
                fail();
            }
        });
    });

    describe("➔ Testing upvote", () => {
        jest.spyOn(recommendationRepository, "updateScore").mockImplementation(
            factory.newMockImplementation(),
        );
        it("Testing upvote with invalid Id - should throw error(not_found)", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                () => null,
            );
            try {
                await recommendationService.upvote(+faker.random.numeric(3));
                fail();
            } catch (err) {
                expect(recommendationRepository.find).toBeCalled();
                expect(recommendationRepository.updateScore).not.toBeCalled();
                expect(err.type).toBe("not_found");
            }
        });

        it("Testing upvote on valid Id - should go without errors", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                factory.newMockImplementation(),
            );
            try {
                await recommendationService.upvote(+faker.random.numeric(3));
                expect(recommendationRepository.find).toBeCalled();
                expect(recommendationRepository.updateScore).toBeCalled();
            } catch (_) {
                fail();
            }
        });
    });

    describe("➔ Testing downvote", () => {
        jest.spyOn(recommendationRepository, "updateScore").mockImplementation(
            factory.newMockImplementation(),
        );
        jest.spyOn(recommendationRepository, "remove").mockImplementation(
            () => null,
        );
        it("Testing downvote with invalid Id - should throw error(not_found)", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                () => null,
            );
            try {
                await recommendationService.downvote(+faker.random.numeric());
                fail();
            } catch (err) {
                expect(recommendationRepository.find).toBeCalled();
                expect(recommendationRepository.updateScore).not.toBeCalled();
                expect(recommendationRepository.remove).not.toBeCalled();

                expect(err.type).toBe("not_found");
            }
        });

        it("Testing downvote with a valid Id - should pass without throwing errors", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                factory.newMockImplementation(),
            );
            try {
                await recommendationService.downvote(+faker.random.numeric());
                expect(recommendationRepository.find).toBeCalled();
                expect(recommendationRepository.updateScore).toBeCalled();
                expect(recommendationRepository.remove).not.toBeCalled();
            } catch (err) {
                fail();
            }
        });

        it("Testing downvoting a item with less than -5 of score - should call 'remove'", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                factory.newMockImplementation(),
            );
            jest.spyOn(
                recommendationRepository,
                "updateScore",
            ).mockImplementationOnce(
                factory.newMockImplementation({ score: -6 }),
            );

            try {
                await recommendationService.downvote(+faker.random.numeric(3));
                expect(recommendationRepository.find).toBeCalled();
                expect(recommendationRepository.updateScore).toBeCalled();
                expect(recommendationRepository.remove).toBeCalled();
            } catch (_) {
                fail();
            }
        });
    });

    describe("➔ Testing services that get resources", () => {
        it("Get item by id with invalid id - should fail and throw error", async () => {
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                () => null,
            );
            try {
                await recommendationService.getById(+faker.random.numeric());
                fail();
            } catch (err) {
                expect(recommendationRepository.find).toBeCalled();
            }
        });

        it("Get item by id with valid id - should pass without errors ", async () => {
            const data = factory.generateRecommendationResult();
            jest.spyOn(recommendationRepository, "find").mockImplementationOnce(
                factory.newMockImplementation(data),
            );
            try {
                const video = await recommendationService.getById(data.id);
                expect(recommendationRepository.find).toBeCalled();
                expect(video).toMatchObject(data);
            } catch (err) {
                fail();
            }
        });

        it("get all items - should not throw errors", async () => {
            const data = factory.generateRecommendationResult();
            jest.spyOn(
                recommendationRepository,
                "findAll",
            ).mockImplementationOnce(factory.newMockImplementation(data, 10));
            try {
                const videos = await recommendationService.get();
                expect(recommendationRepository.findAll).toBeCalled();
                for (const video of videos) {
                    expect(video).toMatchObject(data);
                }
            } catch (_) {
                fail();
            }
        });

        it("Get all itens ordered by score - should pass without errors", async () => {
            jest.spyOn(
                recommendationRepository,
                "getAmountByScore",
            ).mockImplementationOnce((amount) =>
                factory
                    .newMockImplementation({}, amount)()
                    .sort((a: Recommendation, b: Recommendation) =>
                        a.score - b.score < 0 ? 1 : -1,
                    ),
            );
            try {
                const amount = +faker.random.numeric(1);
                const videos = await recommendationService.getTop(amount);
                expect(areScoresOrdered(videos)).toBeTruthy();
                expect(recommendationRepository.getAmountByScore).toBeCalled();
                expect(videos.length).toBe(amount);
            } catch (_) {
                fail();
            }
        });
    });

    describe("➔ Testing random recommendation", () => {
        it("Get random video when the database is empty - should throw error(not_found)", async () => {
            jest.spyOn(recommendationRepository, "findAll").mockReturnValueOnce(
                [] as any,
            );

            try {
                await recommendationService.getRandom();
                fail();
            } catch (err) {
                expect(recommendationRepository.findAll).toBeCalled();
                expect(err.type).toBe("not_found");
            }
        });

        it("Get a random recomendation when Math.random result is less than 0.7", async () => {
            const highScore = 100;
            jest.spyOn(Math, "random").mockReturnValueOnce(0.6);
            jest.spyOn(
                recommendationRepository,
                "findAll",
            ).mockImplementationOnce(
                factory.newMockImplementation({ score: highScore }, 10),
            );
            try {
                const video = await recommendationService.getRandom();
                expect(recommendationRepository.findAll).toBeCalled();
                expect(video.score).toBe(highScore);
            } catch (err) {
                fail();
            }
        });

        it("Get a random recomendation when Math.random result is greater than 0.7", async () => {
            const lowScore = 1;
            jest.spyOn(Math, "random").mockReturnValueOnce(0.8);
            jest.spyOn(
                recommendationRepository,
                "findAll",
            ).mockImplementationOnce(
                factory.newMockImplementation({ score: lowScore }, 10),
            );
            try {
                const video = await recommendationService.getRandom();
                expect(recommendationRepository.findAll).toBeCalled();
                expect(video.score).toBe(lowScore);
            } catch (err) {
                fail();
            }
        });
    });
});
