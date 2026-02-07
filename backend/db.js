import mongoose from "mongoose";

export const connectdb=async () => {
    try {
        await mongoose 
          .connect(process.env.MONGODB_URI, {
            family: 4,
            serverApi: { version: '1', strict: true, deprecationErrors: true },
          })
           
    } catch (error) {
        console.log(error);
    }
}