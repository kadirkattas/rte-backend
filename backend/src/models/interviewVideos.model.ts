import { Schema, model, Document } from "mongoose";

export interface InterviewVideos extends Document {
  interviewId: string;
  videos: InterviewVideo[];
}

interface InterviewVideo {
  path: string;
  thumbnailPath: string;
  note: string;
  times: time[];
  intervieweeId: string;
  approved: Boolean;
  rejected: Boolean;
  new: Boolean;
  videoId: string;
}

interface time {
  questionNumber: number;
  minutes: string;
}

const InterviewVideosSchema = new Schema({
  interviewId: { type: String, required: true },
  videos: [
    {
      path: { type: String, required: true },
      thumbnailPath: { type: String, required: true },
      note: { type: String, required: true },
      time: [
        {
          questionNumber: { type: Number, required: true },
          minutes: { type: String, required: true },
          _id: false,
        },
      ],
      intervieweeId: { type: String, required: true },
      approved: { type: Boolean, required: true },
      rejected: { type: Boolean, required: true },
      new: { type: Boolean, required: true },
    },
  ],
});

const InterviewVideosModel = model<InterviewVideos>(
  "InterviewVideos",
  InterviewVideosSchema
);

export default InterviewVideosModel;
