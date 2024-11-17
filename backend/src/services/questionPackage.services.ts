import QuestionPackageModel from "../models/questionPackage.model";
import { QuestionPackage } from "../models/questionPackage.model";
import { setOrderNumberToTheQuestions } from "../utils/helper.functions";
import { ObjectId } from "mongodb"; // MongoDB ObjectId kütüphanesi

export const CreateQuestionPackage = async (
  questionPackageData: QuestionPackage
) => {
  const newQuestionPackage = new QuestionPackageModel(questionPackageData); // Creates a new question package
  await newQuestionPackage.save(); // Save the new question package
  return newQuestionPackage; // Return the new question package
};

export const GetAllQuestionPackages = async () => {
  return await QuestionPackageModel.find().sort({ createdAt: -1 }); // Return all question packages
};

export const GetQuestionPackageById = async (id: string) => {
  return await QuestionPackageModel.findById(id); // Return a question package by id
};

export const DeleteAQuestionPackageById = async (id: string) => {
  return await QuestionPackageModel.findByIdAndDelete(id); // Delete a question package by id
};

export const UpdateQuestionPackageById = async (
  questionPackageData: QuestionPackage,
  id: string
) => {
  // Update a question package by id
  questionPackageData.questionCount = questionPackageData.questions.length; // Count the number of questions

  questionPackageData.questions =
    setOrderNumberToTheQuestions(questionPackageData).questions; // Set the order number of the questions

  questionPackageData.questions = questionPackageData.questions.map(
    (question) => {
      if (!question._id) {
        question._id = new ObjectId().toString(); // Yeni bir ObjectId olarak _id ata
      }
      return question;
    }
  );
  await QuestionPackageModel.findByIdAndUpdate(id, questionPackageData); // Update an interview videos by id
  const savedQuestionPackage = await QuestionPackageModel.findById(id); // Find the updated interview videos by

  return savedQuestionPackage; // Return the updated question package
};
