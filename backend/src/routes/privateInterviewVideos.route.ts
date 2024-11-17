import { Router } from "express";
import {
  createInterviewVideo,
  getInterviewVideo,
  getInterviewVideos,
  updateInterviewVideo,
  getQuestionById,
  getVideoForWatch,
  updateVideoInfo,
  getVideoInfoById,
} from "../controllers/interviewVideo.controller";

const router = Router();

// Routes for interview videos
router.post("/create-interview-video", createInterviewVideo);
router.get("/get-interview-videos", getInterviewVideos);
router.get("/get-interview-video/:id", getInterviewVideo);
router.put("/update-interview-video/:id", updateInterviewVideo);

router.get("/get-video-for-watch/:id", getVideoForWatch);
router.put("/update-video-info/:id", updateVideoInfo);
router.get("/get-video-info-by-id/:id", getVideoInfoById);

export default router;
