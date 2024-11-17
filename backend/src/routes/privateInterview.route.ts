import { Router } from "express";

import {
  createInterviews,
  deleteInterview,
  Getinterviews,
  GetinterviewsWithVideoCount,
  Getinterview,
  GetInterviewQuestions,
  EditInterview,
  GetinterviewDetails,
  IsInterviewActive,
} from "../controllers/interview.controller"; // Import the createInterviews controller

const router = Router();

// Route for creating an interview
router.post("/create-interview", createInterviews); // Add this line to handle interview creation
router.delete("/delete-interview/:id", deleteInterview);
router.get("/get-interviews", Getinterviews);
router.get("/get-interviews-with-video-count", GetinterviewsWithVideoCount);
router.get("/get-interview/:id", Getinterview);
router.get("/get-interview-questions/:id", GetInterviewQuestions);

router.put("/edit-interview/:id", EditInterview);

router.get("/get-interview-details/:id", GetinterviewDetails);

export default router;
