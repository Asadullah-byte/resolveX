    import {PrismaClient} from '@prisma/client'

    export const prisma = new PrismaClient();


    export const  connectDB = async() => {
    try {
        await prisma.$connect();
        console.log('DB connection Established... [PostgreSQL ---> Prisma]')
    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1); //1 for failure , 0 for success
    }
    };
