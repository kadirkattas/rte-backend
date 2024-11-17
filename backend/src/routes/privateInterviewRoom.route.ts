import { Router } from "express";
import {
  getInterviewRoomInfo,
  saveVideoToCloud,
} from "../controllers/interviewRoom.controller";
import multer from "multer";
import {
  GetInterviewQuestionsWithInterviewUrl,
  IsInterviewActive,
} from "../controllers/interview.controller";
import { getQuestionById } from "../controllers/interviewVideo.controller";
import { CreatePersonalForm } from "../controllers/personalForm.controller";

const router = Router();

const storage = multer.memoryStorage(); // Videoyu bellekte saklayın
const upload = multer({ storage });

router.get("/interview-room-info", getInterviewRoomInfo);
router.post("/upload-video", upload.single("file"), saveVideoToCloud);
router.get(
  "/get-interview-questions-with-url/:id",
  GetInterviewQuestionsWithInterviewUrl
);
router.get("/get-question-by-id/:id", getQuestionById);
router.post("/create-personal-form", CreatePersonalForm);
router.get("/is-interview-active/:id", IsInterviewActive);

export default router;
