import Interview from "../models/interview.model";
import dotenv from "dotenv";
import {
  GetObjectCommand,
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

export const getAInterviewRoomInfo = async (interviewUrl: string) => {
  try {
    // Veritabanından URL'ye göre interview bilgilerini çek
    const interviewData = await Interview.findOne({
      interviewUrl: interviewUrl,
    });

    if (!interviewData) {
      throw new Error("Interview not found");
    }

    // Çekilen verilerden istediğiniz alanları JSON formatında döndür
    const data = {
      interviewTitle: interviewData.interviewTitle,
      questionPackages: interviewData.packages,
      questionCount: interviewData.questionCount,
    };

    return data; // Veriyi JSON formatında döndür
  } catch (error) {
    console.error("Error fetching interview data:", error);
    throw error; // Hata oluştuysa hatayı fırlat
  }
};

if (!process.env.ACCESS_KEY || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are not defined");
}

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getFileUrl = async (videoKey: string) => {
  try {
    // S3 Bucket ve video için GetObjectCommand oluşturuluyor
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: videoKey, // S3'te dosyanın anahtarı (ismi)
    });

    // S3'ten imzalı URL alınıyor, süre 1 saat ile sınırlı (ayarlanabilir)
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // 3600 saniye = 1 saat

    console.log("Signed URL generated successfully:", signedUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL for video:", error);
    throw new Error("Unable to generate signed URL. Please try again.");
  }
};

export const uploadFileS3 = async (key: string, file: any) => {
  try {
    // Eğer `file` bir Buffer ise doğrudan kullan, değilse `file.buffer` alanını kullan
    const fileBody = file instanceof Buffer ? file : file.buffer;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key, // S3'te dosyanın ismi (key)
      Body: fileBody, // Dosyanın tampon verisi
      ContentType: file.mimetype || "application/octet-stream", // Dosya tipi
    });

    // Komutu S3'e gönder
    const uploadResult = await s3Client.send(command);

    console.log("Video uploaded successfully:", uploadResult);

    // Video ismine ulaşmak
    const videoName = key; // Yüklediğiniz dosyanın ismi (Key olarak verdiğiniz değer)
    return { uploadResult, videoName };
  } catch (error) {
    console.error("Error uploading video to S3:", error);
    throw error;
  }
};

export const deleteVideos = async (interviewFolderKey: string) => {
  try {
    console.log(`Deleting all items under: ${interviewFolderKey}`);

    // 1. Listeyi çekin
    const listParams = {
      Bucket: process.env.BUCKET_NAME,
      Prefix: interviewFolderKey + "/",
    };
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command(listParams)
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log("Folder is empty or does not exist.");
      return;
    }

    // 2. Her bir dosya için silme işlemi
    const deletePromises = listedObjects.Contents.map(({ Key }) =>
      s3Client.send(
        new DeleteObjectCommand({ Bucket: process.env.BUCKET_NAME, Key })
      )
    );
    await Promise.all(deletePromises);

    console.log("Folder deleted successfully.");
  } catch (error) {
    console.error("Error deleting folder from S3:", error);
    throw error;
  }
};
