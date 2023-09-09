import mongoose from 'mongoose';
require('dotenv').config();

const dbURL = process.env.DB_URI || "";

// connect to mongodb
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(dbURL).then((data:any) => console.log(`MongoDB connected ${data.connection.host}`));
    } catch (error:any) {
        console.log(error);
        setTimeout(connectDB, 5000);
        process.exit(1); // exit with failure, 1 indicates failure
    }
};