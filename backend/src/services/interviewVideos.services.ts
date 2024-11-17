import InterviewVideosModel from "../models/interviewVideos.model";
import { InterviewVideos } from "../models/interviewVideos.model";
import { getFileUrl } from "./interviewRoom.services";

export const createInterviewVideos = async (
  interviewVideosData: InterviewVideos
) => {
  const newInterviewVideos = new InterviewVideosModel(interviewVideosData); // Create a new interview videos record
  await newInterviewVideos.save(); // Save the new interview videos record to the database
  return newInterviewVideos; // Return the newly created interview videos record
};

export const getAllInterviewVideos = async () => {
  return await InterviewVideosModel.find(); // Return all interview videos
};

export const getInterviewVideosById = async (id: string) => {
  const videos = await InterviewVideosModel.findOne({ interviewId: id }).lean(); // lean() ile düz JS nesnesi olarak alıyoruz

  if (videos?.videos.length && videos.videos[0].thumbnailPath) {
    const updatedVideos = await Promise.all(
      videos.videos.map(async (video) => ({
        ...video, // Video nesnesini genişlet
        signedThumbnailUrl: await getFileUrl(video.thumbnailPath), // signedThumbnailUrl alanını ekle
      }))
    );
    console.log(updatedVideos);
    return { ...videos, videos: updatedVideos }; // Güncellenmiş videos dizisini içeren nesneyi döndür
  }

  return videos;
};

export const updateInterviewVideosById = async (
  interviewVideosData: InterviewVideos,
  id: string
): Promise<InterviewVideos | null> => {
  // Fetch the existing interview videos document
  const existingData = await InterviewVideosModel.findOne({ interviewId: id });

  if (!existingData) {
    // Handle the case where no document is found
    console.error("No document found with that ID");
    return null;
  }

  // Append new videos to the existing videos array
  const updatedVideos = [...existingData.videos, ...interviewVideosData.videos];

  // Update the interview videos with the new videos array
  const updatedData = await InterviewVideosModel.findByIdAndUpdate(
    existingData._id,
    { videos: updatedVideos }, // Only update the videos field
    { new: true }
  );

  // Return the updated interview videos
  return updatedData;
};
