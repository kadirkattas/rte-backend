import QuestionPackageModel, {
  QuestionPackage,
} from "../models/questionPackage.model";
import InterviewsModel, { Interviews } from "../models/interview.model";
import { InterviewVideos } from "../models/interviewVideos.model";
import { v4 as uuidv4 } from "uuid";

export const setOrderNumberToTheQuestions = (
  questionPackageData: QuestionPackage
) => {
  questionPackageData.questions.forEach((question, index) => {
    question.orderNumber = index + 1;
  });
  return questionPackageData;
};

export const setOrderNumberToTheExtraQuestions = (
  interviewData: Interviews
) => {
  interviewData.extraQuestions.forEach((question, index) => {
    question.orderNumber = index + 1;
  });
  return interviewData;
};

export const setUrlToInterview = async (interview: Interviews) => {
  let interviewTitle = interview.interviewTitle;
  console.log(interviewTitle);
  if (!interviewTitle || typeof interviewTitle !== "string") {
    throw new Error("Invalid interview title");
  }

  // interviewTitle varsa, işlemlere devam edin
  interviewTitle = interviewTitle.replace(/ /g, "-");
  interviewTitle = interviewTitle.toLowerCase();
  interviewTitle = interviewTitle + "-" + String(uuidv4()); // uuidv4 fonksiyonunu çağırıyoruz
  return interviewTitle;
};

export const setQuestionCountToInterview = async (interview: Interviews) => {
  try {
    // Başlangıç olarak extraQuestions sayısını ekleyin
    let totalQuestionCount = interview.extraQuestions.length;

    // Her bir package için soruları çek ve toplam sayıya ekle
    for (let i = 0; i < interview.packages.length; i++) {
      const questionPackage = await QuestionPackageModel.findById(
        interview.packages[i].packageId
      );

      // Eğer package bulunduysa, içindeki soruların sayısını toplam sayıya ekle
      if (questionPackage) {
        totalQuestionCount += questionPackage.questions.length;
      }
    }

    // Hesaplanan toplam soru sayısını interview'a ata
    interview.questionCount = totalQuestionCount;

    // Güncellenmiş interview dönebilir ya da bu fonksiyon içerisinde başka bir işlem yapabilirsiniz
    return interview;
  } catch (error) {
    console.error("Error setting question count:", error);
    throw error; // Hata varsa fırlat
  }
};
