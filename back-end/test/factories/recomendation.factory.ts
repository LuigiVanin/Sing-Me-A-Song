import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

class RecomendationFactory {
    constructor() {}

    public async createVideo() {
        const data = this.generateVideoData("youtube");
        await prisma.recommendation.create({
            data,
        });
        return data;
    }

    public generateVideoData(
        padrao?: "youtube" | "any"
    ): CreateRecommendationData {
        const youtubeLink =
            padrao === "youtube"
                ? `https://www.youtube.com/ ${faker.random.alpha()}`
                : faker.internet.url();
        return {
            name: faker.music.songName(),
            youtubeLink,
        };
    }

    public async inspectResult(name: string) {
        return await prisma.recommendation.findFirst({
            where: {
                name,
            },
        });
    }
}

export default RecomendationFactory;
