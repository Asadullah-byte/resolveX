    import {PrismaClient} from '@prisma/client'
    import mongoose from "mongoose";
    import dotenv from "dotenv";


    dotenv.config();
    export const prisma = new PrismaClient();


    export const  connectDB = async() => {
    try {
        await prisma.$connect();
        console.log('DB connection Established... [PostgreSQL ---> Prisma]')

        await mongoose.connect(process.env.MONGO_URI);
          console.log("✅ MongoDB connection established...");

    } catch (error) {
        console.error('Connection Error:', error);
        process.exit(1); //1 for failure , 0 for success
    }
    };
