import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
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
        padrao?: "youtube" | "any",
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

    public generateRecommendationResult(data?: Partial<Recommendation>) {
        return {
            id: data?.id || +faker.random.numeric(),
            score: data?.score || Math.abs(+faker.random.numeric(3)),
            name: data?.name || faker.music.songName(),
            youtubeLink:
                data?.youtubeLink ||
                `https://www.youtube.com/${faker.random.alpha(10)}`,
        };
    }

    public newMockImplementation(
        data?: Partial<Recommendation>,
        amount?: number,
    ) {
        return (): any => {
            if (!amount) return this.generateRecommendationResult(data);
            return new Array(amount)
                .fill(null)
                .map(() => this.generateRecommendationResult(data));
        };
    }
}

export default RecomendationFactory;
