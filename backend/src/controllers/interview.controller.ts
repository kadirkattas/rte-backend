import e, { Request, Response } from "express";
import { Interviews } from "../models/interview.model";

import {
  createInterview,
  GetAinterview,
  GetAllinterviews,
  GetAinterviewWithUrl,
  GetAinterviewDetails,
} from "../services/interview.services";
import {
  deleteInterviewById,
  updateInterviewById,
} from "../services/interview.services";
import { setOrderNumberToTheExtraQuestions } from "../utils/helper.functions";
import InterviewVideosModel, {
  InterviewVideos,
} from "../models/interviewVideos.model";
import QuestionPackageModel from "../models/questionPackage.model";
import { createInterviewVideos } from "../services/interviewVideos.services";

export const createInterviews = async (req: Request, res: Response) => {
  try {
    // İstekten gelen interview verisini alıyoruz
    let interviewData: Interviews = req.body;

    // Eğer ekstra sorular yoksa boş array olarak ayarlıyoruz
    if (!interviewData.extraQuestions) {
      interviewData.extraQuestions = [];
    }

    // Ekstra sorulara sıra numarası atıyoruz
    interviewData.extraQuestions =
      setOrderNumberToTheExtraQuestions(interviewData).extraQuestions;

    // Yeni interview oluşturuluyor ve veritabanına kaydediliyor
    const savedInterview = await createInterview(interviewData);

    // Boş bir video listesi (array) oluşturuyoruz ve interviewId ile ilişkilendiriyoruz
    const interviewVideos = new InterviewVideosModel({
      interviewId: savedInterview.id,
      videos: [], // Şu an için boş video listesi
    });

    // Boş video listesi veritabanına kaydediliyor
    await createInterviewVideos(interviewVideos);

    // Başarı mesajı ve oluşturulan interview bilgileri döndürülüyor
    res.status(201).json({
      message: "Interview created successfully",
      interview: savedInterview,
    });
  } catch (error) {
    // Hata yakalanıyor ve loglanıyor
    console.error("Error creating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const deleteInterview = async (req: Request, res: Response) => {
//   try {
//     await deleteInterviewById(req.params.id);
//     res.status(200).json({ message: "Interview deleted successfully" });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;

    // Interview'u silmeden önce, ilgili videoları sil
    await InterviewVideosModel.deleteMany({ interviewId });

    // Interview'u sil
    await deleteInterviewById(interviewId);

    res.status(200).json({
      message: "Interview and associated videos deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Getinterviews = async (req: Request, res: Response) => {
  try {
    const interviews = await GetAllinterviews();
    res.status(200).json({ message: "Question packages fetched", interviews });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toplam video sayısı ile birlikte röportajları döndüren fonksiyon
export const GetinterviewsWithVideoCount = async (
  req: Request,
  res: Response
) => {
  try {
    // Tüm röportajları al
    const interviews = await GetAllinterviews();

    // Her röportaj için toplam video sayısını hesapla
    const interviewsWithVideoCount = await Promise.all(
      interviews.map(async (interview) => {
        // Röportajla ilişkili video sayısını InterviewVideosModel'den alıyoruz
        const interviewVideoDocument = await InterviewVideosModel.findOne({
          interviewId: interview._id,
        });

        const videoCount = interviewVideoDocument?.videos.length;

        const unTouchedVideos =
          interviewVideoDocument?.videos.filter(
            (video) => video.approved === false && video.rejected === false
          ).length || 0;

        return {
          ...interview.toObject(), // Röportaj bilgilerini al
          totalVideos: videoCount, // Toplam video sayısını ekliyoruz
          onHold: unTouchedVideos,
        };
      })
    );

    res.status(200).json({
      message: "Interviews with video count fetched",
      interviews: interviewsWithVideoCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Getinterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const interview = await GetAinterview(id);
    res.status(200).json({ message: "Question packages fetched", interview });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const interview = await GetAinterview(id);
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    const questionPackages = interview.packages;

    // Ensure that you are getting only the packageId from the package
    const questions = await Promise.all(
      questionPackages.map(async (pkg) => {
        // Assuming pkg is an object and has a packageId property
        const questionPackage = await QuestionPackageModel.findById(
          pkg.packageId
        );
        return questionPackage?.questions.map((question) => {
          return {
            question: question.question,
            time: question.time,
            packageTitle: questionPackage.packageTitle,
          };
        }); //add question title to inside of a question object
      })
    );

    // Flatten the array of questions from the packages
    const flattenedQuestions = questions.flat();

    // Add extra questions if they exist
    const extraQuestions = interview.extraQuestions || [];
    const allQuestions = [...flattenedQuestions, ...extraQuestions]; // Combine the arrays

    res
      .status(200)
      .json({ message: "Questions fetched", questions: allQuestions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetInterviewQuestionsWithInterviewUrl = async (
  req: Request,
  res: Response
) => {
  try {
    const interviewUrl = req.params.id;

    const interview = await GetAinterviewWithUrl(interviewUrl);
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    const questionPackages = interview.packages;

    // Ensure that you are getting only the packageId from the package
    const questions = await Promise.all(
      questionPackages.map(async (pkg) => {
        // Assuming pkg is an object and has a packageId property
        const questionPackage = await QuestionPackageModel.findById(
          pkg.packageId
        );
        return questionPackage?.questions.map((question) => question.id) || []; // Return question IDs or an empty array if not found
      })
    );

    // Flatten the array of question IDs from the packages
    const flattenedQuestionIds = questions.flat();

    // Add extra question IDs if they exist
    const extraQuestions = interview.extraQuestions || [];
    const extraQuestionIds = extraQuestions.map((question) => question.id); // Extract IDs from extra questions
    const allQuestionIds = [...flattenedQuestionIds, ...extraQuestionIds]; // Combine the arrays of IDs

    res
      .status(200)
      .json({ message: "Question IDs fetched", questionIds: allQuestionIds });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const EditInterview = async (req: Request, res: Response) => {
  try {
    const interviewId = req.params.id;
    const updatedData: Interviews = req.body;

    // Mevcut interview'u kontrol et
    const existingInterview = await GetAinterview(interviewId);
    if (!existingInterview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    // Eğer extraQuestions yoksa, boş array olarak ayarla
    if (!updatedData.extraQuestions) {
      updatedData.extraQuestions = [];
    }

    // extraQuestions'a sıra numaralarını atayın
    updatedData.extraQuestions =
      setOrderNumberToTheExtraQuestions(updatedData).extraQuestions;

    // Veritabanında röportajı güncelle
    const updatedInterview = await updateInterviewById(
      interviewId,
      updatedData
    );

    res.status(200).json({
      message: "Interview updated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const GetinterviewDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    // Interview bilgilerini al
    const interview = await GetAinterviewDetails(id);

    // Eğer interview bulunamazsa 404 hatası döndür
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }
    // Eğer packages mevcutsa, ilgili her bir QuestionPackage modelinden packageTitle'ı al
    let packageTitles: string[] = [];
    if (interview.packages && interview.packages.length > 0) {
      for (const pkg of interview.packages) {
        // Burada her bir packageId ile QuestionPackage modelinden packageTitle'ı alıyoruz
        const packageData = await QuestionPackageModel.findById(
          pkg.packageId,
          "packageTitle"
        );
        packageTitles.push(String(packageData?.packageTitle));
      }
    }
    // Interview verisi ile birlikte packageTitles bilgisi döndürülüyor
    res.status(200).json({
      message: "Interview and package details fetched",
      interview: {
        ...interview.toObject(),
        packageTitles: packageTitles, // packageTitles bilgisini interview'a ekle
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const IsInterviewActive = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const interview = await GetAinterviewWithUrl(id);
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    const currentDate = new Date();
    let interviewActive = true;

    if (interview.interviewExpireDate < currentDate) {
      interviewActive = false;
    }

    res.status(200).json({
      message: "Interview acitve status fetched",
      isActive: interviewActive,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
