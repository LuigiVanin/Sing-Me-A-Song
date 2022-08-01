import { Recommendation } from "@prisma/client";

export const areScoresOrdered = (arr: Recommendation[]) => {
    let last = Infinity;
    for (const i of arr) {
        if (i.score > last) return false;
    }
    return true;
};
