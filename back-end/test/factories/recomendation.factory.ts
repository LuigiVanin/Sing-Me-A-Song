import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database";
import { CreateRecommendationData } from "../../src/services/recommendationsService";

class RecomendationFactory {
    constructor() {}

    public async createVideo(score?: number) {
        let data = this.generateVideoData("youtube");
        await prisma.recommendation.create({
            data: {
                ...data,
                score,
            },
        });
        return data;
    }

    public generateVideoData(
        padrao?: "youtube" | "any"
    ): CreateRecommendationData {
        const youtubeLink =
            padrao === "youtube"
                ? `https://www.youtube.com/${faker.random.alpha(10)}`
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
