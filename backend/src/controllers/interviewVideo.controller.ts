import { Request, Response } from "express";
import {
  createInterviewVideos,
  getAllInterviewVideos,
  getInterviewVideosById,
  updateInterviewVideosById,
} from "../services/interviewVideos.services";
import InterviewModel from "../models/interview.model";
import QuestionPackageModel from "../models/questionPackage.model";
import InterviewVideosModel from "../models/interviewVideos.model";
import { getFileUrl } from "../services/interviewRoom.services";

export const createInterviewVideo = async (req: Request, res: Response) => {
  try {
    // Gelen veriyi alıyoruz
    const interviewVideoData = req.body;

    // Interview video verisini kaydediyoruz
    const savedInterviewVideo = await createInterviewVideos(interviewVideoData);

    // Kaydedilen interview video'daki videos arrayinin uzunluğunu alıyoruz
    const totalVideos = savedInterviewVideo.videos.length;

    // Interview kaydını bulup totalVideos'u güncelliyoruz
    await InterviewModel.findByIdAndUpdate(savedInterviewVideo.interviewId, {
      totalVideos: totalVideos,
    });

    res.status(201).json({
      message: "Interview video created",
      interviewVideo: savedInterviewVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInterviewVideos = async (req: Request, res: Response) => {
  try {
    // Get all interview videos
    const interviewVideos = await getAllInterviewVideos();
    res
      .status(200)
      .json({ message: "Interview videos fetched", interviewVideos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getInterviewVideo = async (req: Request, res: Response) => {
  try {
    // Get an interview video by id
    const interviewVideo = await getInterviewVideosById(req.params.id);

    if (!interviewVideo) {
      res.status(404).json({ message: "Interview video not found" });
      return;
    }
    res
      .status(200)
      .json({ message: "Interview video fetched", interviewVideo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateInterviewVideo = async (req: Request, res: Response) => {
  try {
    const interviewVideoData = req.body;
    const updatedInterviewVideo = await updateInterviewVideosById(
      interviewVideoData,
      req.params.id
    );

    // Güncelleme başarısız olursa null kontrolü
    if (!updatedInterviewVideo) {
      res.status(404).json({ message: "Interview video not found" });
      return;
    }

    // Güncellenmiş video verisi ile ilişkili interview kaydını bul
    const relatedInterview = await InterviewModel.findById(req.params.id);

    // İlgili interview bulunamazsa
    if (!relatedInterview) {
      res.status(404).json({ message: "Related interview not found" });
      return;
    }

    // totalVideos'u güncelle
    relatedInterview.totalVideos = updatedInterviewVideo.videos.length;
    await relatedInterview.save();

    res.status(200).json({
      message: "Interview video updated",
      interviewVideo: updatedInterviewVideo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const questionId = req.params.id; // Get the question ID from the URL parameters

    // Find the question package that contains the question with the specified ID
    const questionPackage = await QuestionPackageModel.findOne({
      "questions._id": questionId,
    });

    // If no package is found, check in the Interviews schema's extraQuestions
    if (!questionPackage) {
      const interviewWithExtraQuestions = await InterviewModel.findOne({
        "extraQuestions._id": questionId,
      });

      if (interviewWithExtraQuestions) {
        // Find the specific question from extraQuestions by its ID
        const question = interviewWithExtraQuestions.extraQuestions.find(
          (q) => q._id.toString() === questionId // Convert to string for comparison
        );

        if (question) {
          res.status(200).json({
            message: "Question fetched successfully from extraQuestions",
            question,
          });
          return;
        } else {
          res
            .status(404)
            .json({ message: "Question not found in extraQuestions" });
          return;
        }
      } else {
        res.status(404).json({ message: "Question not found" });
        return;
      }
    }

    // Find the specific question by its ID from the package
    const question = questionPackage.questions.find(
      (q) => q._id.toString() === questionId // Convert to string for comparison
    );

    // Return the question if found
    if (question) {
      res.status(200).json({
        message: "Question fetched successfully from Question Package",
        question,
      });
      return;
    } else {
      res.status(404).json({ message: "Question not found in the package" });
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVideoForWatch = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id; // Get the video ID from the URL parameters

    const video = await InterviewVideosModel.findOne(
      { "videos._id": videoId },
      { "videos.$": 1 }
    );

    if (!video || !video.videos.length) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    const key = video.videos[0].path;
    const signedUrl = await getFileUrl(key);

    res.status(200).json({ message: "Interview video fetched", signedUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateVideoInfo = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;
    const { note, rejected, approved, interviewId } = req.body;

    // videoId, güncellenmek istenen videonun _id'sidir
    const video = await InterviewVideosModel.findOneAndUpdate(
      { "videos._id": videoId }, // videos içindeki _id'ye göre bul
      {
        $set: {
          "videos.$.note": note, // note'u güncelle
          "videos.$.rejected": rejected, // status'u güncelle
          "videos.$.approved": approved, // status'u güncelle
        },
      },
      { new: true }
    );

    if (!video) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    // Eğer video approved ya da rejected ise, interview'daki onHold sayısını azalt

    const interview = await InterviewModel.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    interview.onHold = video.videos.filter(
      (video) => video.approved === false && video.rejected === false
    ).length;
    await interview.save();

    res.status(200).json({ message: "Video info updated", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVideoInfoById = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.id;

    const video = await InterviewVideosModel.findOne(
      { "videos._id": videoId },
      { "videos.$": 1 }
    );

    if (!video || !video.videos.length) {
      res.status(404).json({ message: "Video not found" });
      return;
    }

    res.status(200).json({ message: "Video fetched", video: video.videos[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
