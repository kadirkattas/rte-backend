import { Request, Response } from "express";
import { QuestionPackage } from "../models/questionPackage.model";
import {
  CreateQuestionPackage,
  GetAllQuestionPackages,
  GetQuestionPackageById,
  DeleteAQuestionPackageById,
  UpdateQuestionPackageById,
} from "../services/questionPackage.services";
import { setOrderNumberToTheQuestions } from "../utils/helper.functions";
import InterviewModel from "../models/interview.model";

export const CreateQuestionPackages = async (req: Request, res: Response) => {
  try {
    const questionPackageData: QuestionPackage = req.body;

    questionPackageData.questionCount = questionPackageData.questions.length; // Count the number of questions

    questionPackageData.questions =
      setOrderNumberToTheQuestions(questionPackageData).questions; // Set the order number of the questions

    const savedQuestionPackage = await CreateQuestionPackage(
      questionPackageData
    );
    res.status(201).json({
      message: "Question package created",
      questionPackage: savedQuestionPackage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetQuestionPackages = async (req: Request, res: Response) => {
  try {
    const questionPackages = await GetAllQuestionPackages();
    res
      .status(200)
      .json({ message: "Question packages fetched", questionPackages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetQuestionPackage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questionPackage = await GetQuestionPackageById(req.params.id);
    if (!questionPackage) {
      res.status(404).json({ message: "Question package not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Question package fetched", questionPackage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const DeleteQuestionPackageById = async (
  req: Request,
  res: Response
) => {
  try {
    const packageId = req.params.id;

    // Interview içerisinde bu packageId ile eşleşen bir paket var mı kontrol et
    const interviewsUsingPackage = await InterviewModel.find({
      "packages.packageId": packageId,
    });

    // Eğer paket herhangi bir mülakatta kullanılıyorsa silmeye izin verme
    if (interviewsUsingPackage.length > 0) {
      res.status(400).json({
        message:
          "This question package is being used in an interview and cannot be deleted.",
        interviewsUsingPackage,
      });
      return;
    }

    // Paket kullanılmıyorsa silme işlemini yap
    await DeleteAQuestionPackageById(packageId); // Delete a question package by id
    res.status(200).json({ message: "Question package deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const UpdateQuestionPackage = async (req: Request, res: Response) => {
  try {
    const questionPackageData: QuestionPackage = req.body;

    const savedQuestionPackage = await UpdateQuestionPackageById(
      questionPackageData,
      req.params.id
    );
    res.status(200).json({
      message: "Question package updated",
      questionPackage: savedQuestionPackage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
