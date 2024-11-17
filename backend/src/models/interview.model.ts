import { Schema, model, Document } from "mongoose";

export interface Interviews extends Document {
  interviewTitle: string;
  interviewExpireDate: Date;
  questionCount: number;
  packages: Packages[];
  extraQuestions: ExtraQuestions[];
  interviewUrl: string;
  totalVideos: number;
  onHold: number;
}

interface Packages extends Document {
  packageId: string;
}

interface ExtraQuestions extends Document {
  question: string;
  time: number;
  orderNumber: number;
  _id: string;
}

const InterviewsSchema = new Schema(
  {
    interviewTitle: { type: String, required: true },
    interviewExpireDate: { type: Date, required: true },
    questionCount: { type: Number, required: true },
    packages: [
      {
        packageId: { type: String, required: true },
        _id: false,
      },
    ],
    extraQuestions: [
      {
        question: { type: String, required: true },
        time: { type: Number, required: true },
        orderNumber: { type: Number, required: true },
      },
    ],
    interviewUrl: { type: String, required: true },
    totalVideos: { type: Number, default: 0 }, // Veritabanında video sayısını tutmak için
    onHold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const InterviewsModel = model<Interviews>("Interviews", InterviewsSchema);

export default InterviewsModel;
