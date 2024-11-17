import InterviewsModel from "../models/interview.model";
import InterviewsVideosModel from "../models/interviewVideos.model";
import { Interviews } from "../models/interview.model";
import {
  setUrlToInterview,
  setQuestionCountToInterview,
} from "../utils/helper.functions";
import { deleteVideos } from "./interviewRoom.services";

export const createInterview = async (interviewData: Interviews) => {
  const newUrl = await setUrlToInterview(interviewData); // Create a new url for the interview
  interviewData.interviewUrl = newUrl; // Replace the interview url
  interviewData = await setQuestionCountToInterview(interviewData); // Count the number of extra questions
  const newInterview = new InterviewsModel(interviewData); // Create a new interview record
  await newInterview.save(); // Save the new interview record to the database
  return newInterview; // Return the newly created interview record
};

export const deleteInterviewById = async (id: string) => {
  const interview = await InterviewsModel.findByIdAndDelete(id);

  const interviewUrl = interview?.interviewUrl;

  if (interviewUrl) await deleteVideos(interviewUrl);
};

export const GetAllinterviews = async () => {
  return await InterviewsModel.find().sort({ createdAt: -1 }); // Return all question packages
};

export const GetAinterview = async (id: string) => {
  return await InterviewsModel.findById(id); // Return all question packages
};

export const GetAinterviewWithUrl = async (interviewUrl: string) => {
  return await InterviewsModel.findOne({ interviewUrl: interviewUrl }); // Return all question packages
};

export const GetInterviewVideoCount = async (interviewData: Interviews) => {
  const videoCount = (
    await InterviewsVideosModel.findOne({ interviewId: interviewData._id })
  )?.videos.length;
  return videoCount;
};

export const updateInterviewById = async (
  id: string,
  updatedData: Interviews
) => {
  try {
    // Röportajı bulup güncelle
    const newUrl = await setUrlToInterview(updatedData); // Create a new url for the interview
    updatedData.interviewUrl = newUrl;
    updatedData = await setQuestionCountToInterview(updatedData);
    const updatedInterview = await InterviewsModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true, // Güncellenmiş dokümanı döner
      }
    );

    return updatedInterview;
  } catch (error) {
    throw new Error(`Error updating interview: ${error}`);
  }
};

export const GetAinterviewDetails = async (id: string) => {
  return await InterviewsModel.findById(id); // Sadece interview verisini çek
};
