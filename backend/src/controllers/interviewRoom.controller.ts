import { Request, Response } from "express";
import {
  getAInterviewRoomInfo,
  uploadFileS3,
} from "../services/interviewRoom.services";
import { updateInterviewVideosById } from "../services/interviewVideos.services";
import InterviewModel from "../models/interview.model";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "stream";

export const getInterviewRoomInfo = async (req: Request, res: Response) => {
  try {
    const interviewUrl = req.body.interviewUrl;
    const interviewRoomInfo = await getAInterviewRoomInfo(interviewUrl);
    res
      .status(200)
      .json({ message: "Interview room info fetched", interviewRoomInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const saveVideoToCloud = async (req: Request, res: Response) => {
  try {
    const interviewUrl = req.body.interviewUrl;
    const videoFile = req.file;

    const interviewInfo = { ...req.body, videos: JSON.parse(req.body.videos) };

    if (!videoFile) {
      res.status(400).json({ error: "No video file provided" });
      return;
    }

    const videoKey = `${interviewUrl}/${videoFile.originalname}.${uuidv4()}`;

    const { uploadResult, videoName } = await uploadFileS3(videoKey, videoFile);

    const thumbnail = await new Promise<Buffer>((resolve, reject) => {
      const buffers: Buffer[] = [];
      const readableStream = new Readable();
      readableStream.push(videoFile.buffer);
      readableStream.push(null);

      const throughStream = new Writable({
        write(chunk, _, callback) {
          buffers.push(chunk);
          callback();
        },
      });

      ffmpeg(readableStream)
        .on("end", () => resolve(Buffer.concat(buffers)))
        .on("error", (err) => reject(err))
        .frames(1) // Sadece bir kare al
        .seekInput(2) // Videonun ortasından bir kare al
        .format("image2pipe") // Görüntüyü doğrudan belleğe almak için ayarla
        .pipe(throughStream);
    });

    const thumbnailKey = `thumbnails/${interviewUrl}/${uuidv4()}.jpg`;

    await uploadFileS3(thumbnailKey, thumbnail);

    interviewInfo.videos[0].path = videoName;
    interviewInfo.videos[0].thumbnailPath = thumbnailKey;

    const interview = await InterviewModel.findOne({ interviewUrl });
    if (!interview) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }

    const updatedInterviewVideos = await updateInterviewVideosById(
      interviewInfo,
      interview.id
    );

    if (updatedInterviewVideos) {
      interview.totalVideos = updatedInterviewVideos.videos.length;
      interview.onHold = updatedInterviewVideos.videos.filter((video) => {
        if (video.approved === false && video.rejected === false) return video;
      }).length;
      await interview.save();
    } else {
      res.status(500).json({ error: "Failed to update interview videos" });
      return;
    }

    res.status(200).json({
      message: "Video uploaded successfully",
      videoKey: videoName,
      uploadResult: uploadResult,
    });
  } catch (error) {
    console.error("Error uploading video to S3:", error);
    res.status(500).json({ error: "Failed to upload video" });
  }
};
