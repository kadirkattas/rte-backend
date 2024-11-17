import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8080;

export const FRONTEND_USER = process.env.FRONTEND_USER || "";
export const FRONTEND_ADMIN = process.env.FRONTEND_ADMIN || "";

export const MONGO_URL = process.env.MONGO_DB_URL;
