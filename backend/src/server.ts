import express from "express";
import { PORT, FRONTEND_ADMIN, FRONTEND_USER } from "./config/config";
import { connectDB } from "./db/database";
import packageRoutes from "./routes/privatePackage.route";
import interviewRoutes from "./routes/privateInterview.route";
import personalFormRoutes from "./routes/privatePersonalForm.route";
import interviewVideosRoutes from "./routes/privateInterviewVideos.route";
import authRoutes from "./routes/privateAuth.route";
import interviewRoomRoutes from "./routes/privateInterviewRoom.route";
import { jwtAuthMiddleware } from "./middlewares/auth.middleware";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [FRONTEND_ADMIN, FRONTEND_USER], // Replace with your frontend's URL
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/interview-room", interviewRoomRoutes);

app.use(jwtAuthMiddleware);

app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/personal-forms", personalFormRoutes);
app.use("/api/v1/interview-videos", interviewVideosRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
