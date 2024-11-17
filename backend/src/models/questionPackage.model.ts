import { Schema, model, Document } from "mongoose";

export interface QuestionPackage extends Document {
  packageTitle: string;
  questionCount: number;
  questions: Questions[];
}

interface Questions extends Document {
  question: string;
  time: number;
  orderNumber: number;
  _id: string;
}

const QuestionPackageSchema = new Schema(
  {
    packageTitle: { type: String, required: true },
    questionCount: { type: Number, required: true },
    questions: [
      {
        question: { type: String, required: true },
        time: { type: Number, required: true },
        _id: { type: String, required: true },
        orderNumber: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

const QuestionPackageModel = model<QuestionPackage>(
  "QuestionPackage",
  QuestionPackageSchema
);

export default QuestionPackageModel;
