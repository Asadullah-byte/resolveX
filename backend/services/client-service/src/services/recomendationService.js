import {prisma} from  "../../../../db/connectDB.js"

export const recommendEngineers = async (error) => {
    const engineers = await prisma.engineer.findMany({
        include: { career: true }
    });

    return engineers
        .map(engineer => {
            const { career } = engineer;
            let score = 0;

            if (career.specialization === error.domain) score += 50;
            if (career.skills.includes(error.suggested_action)) score += 30;
            score += career.experience * 5;

            return { engineer, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3 recommendations
};


 