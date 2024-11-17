import mongoose from "mongoose";
import { MONGO_URL } from "../config/config";

export const connectDB = async () => {
  if (!MONGO_URL) {
    console.error("MONGO_URL is undefined. Check your environment variables.");
    return;
  }

  await mongoose
    .connect(MONGO_URL)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection failed:", err));
};
