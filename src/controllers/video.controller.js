import asyncHandler from "../utils/asyncHandler.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "../config/index.js";
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import CustomError from "../utils/CustomError.js";
import Movie from "../models/movie.schema.js";

const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

export const addMovie = asyncHandler(async (req, res) => {
  let {
    name,
    displayName,
    year,
    imdbRating,
    movieTime,
    shortIntro,
    director,
    writers,
    cast,
    genre,
  } = req.body;
  cast = cast.split(",").map((cast) => cast.trim());
  writers = writers.split(",").map((writers) => writers.trim());
  genre = genre.split(",").map((genre) => genre.trim());
  if (
    !name ||
    !displayName ||
    !year ||
    !imdbRating ||
    !movieTime ||
    !shortIntro ||
    !director ||
    !writers ||
    !cast ||
    !genre
  ) {
    throw new CustomError("all filed is required.", 500);
  }

  const movie = await Movie.create({
    name,
    displayName,
    year,
    imdbRating,
    movieTime,
    shortIntro,
    director,
    writers,
    cast,
    genre,
  });
  res.status(200).json({
    success: true,
    message: "Hello",
    movie,
  });
});

export const getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.find({});
  if (!movie) {
    throw new CustomError("no movie found", 500);
  }
  res.status(200).json({
    success: true,
    movie,
  });
});

export const getMovieById = asyncHandler(async (req, res) => {
  const { id: MovieId } = req.params;

  const movie = await Movie.findById(MovieId);

  if (!movie) {
    throw new CustomError("no movie found", 404);
  }
  res.status(200).json({
    success: true,
    movie,
  });
});

export const deleteMovieById = asyncHandler(async (req, res) => {
  const { id: MovieId } = req.params;

  const movie = await Movie.findById(MovieId);

  if (!movie) {
    throw new CustomError("no movie found", 404);
  }

  const del = await Movie.findByIdAndDelete(MovieId);
  res.status(200).json({
    success: true,
    movie,
  });
});

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).json({ error: "No video uploaded" });
  }

  const uploadedVideo = req.files.video;
  console.log(req.body.title, uploadedVideo);
  const title = req.body.title;

  const bucketName = "stream-max-temp-01";
  const videoKey = `videos/${title}.mp3`;
  console.log(videoKey);
  console.log(uploadedVideo.data);
  const params = {
    Bucket: bucketName,
    Key: videoKey,
    Body: uploadedVideo.data,
  };

  const videoUrl = `https://${bucketName}.s3.amazonaws.com/${videoKey}`;

  try {
    const command = new PutObjectCommand(params);
    const uploadResponse = await s3Client.send(command);

    console.log(uploadResponse);
    const videoUrl = `https://${bucketName}.s3.amazonaws.com/${videoKey}`;
    console.log(videoUrl);
    res.status(200).json({
      success: true,
      message: "Upload successful",
      videoUrl: videoUrl,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Upload failed" });
  }

  try {
    const response = await fetch(
      "http://localhost:3001/api/v1/movie/transcode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          videoUrl: videoUrl, // Pass the temporary video URL
          title: req.body.title, // Pass the video title
        }),
      }
    );

    if (response.ok) {
      const transcodingResponse = await response.json();
      console.log("Transcoding started res:", transcodingResponse);
    } else {
      console.error("Transcoding API failed");
    }
  } catch (error) {
    console.error("Error calling transcoding API:", error);
  }
});

export const transcode = asyncHandler(async (req, res) => {
  const data = req.body;
  console.log(data);
  const title = data.name;

  try {
    const title = data.name;
    const videoUrl = data.videoUrl;
    console.log(videoUrl);
    //   // Define the resolutions and corresponding bitrates
    const resolutions = [
      { name: "360p", width: 640, height: 360, bitrate: "800k" },
      { name: "480p", width: 854, height: 480, bitrate: "1500k" },
      { name: "720p", width: 1280, height: 720, bitrate: "3000k" },
    ];

    for (const resolution of resolutions) {
      const outputPrefix = `videos/${title}/${resolution.name}`;

      const resolutionDirectory = `videos/${title}/${resolution.name}`;
      if (!fs.existsSync(resolutionDirectory)) {
        fs.mkdirSync(resolutionDirectory, { recursive: true });
      }

      const command = `ffmpeg -i ${videoUrl} -vf "scale=${resolution.width}:${resolution.height}" -c:v libx264 -b:v ${resolution.bitrate} -c:a aac -strict -2 -f hls -hls_time 10 -hls_list_size 0 -hls_segment_filename ${resolutionDirectory}/${resolution.name}_%03d.ts ${resolutionDirectory}/${resolution.name}.m3u8`;
      //     // Run the transcoding command using a child_process library
      execSync(command);
      const uploadParams = {
        Bucket: "stream-max-prod",
        Key: `${outputPrefix}/${resolution.name}.m3u8`,
        Body: fs.readFileSync(`${resolutionDirectory}/${resolution.name}.m3u8`),
        ContentType: "application/vnd.apple.mpegurl",
      };

      const uploadM3U8Command = new PutObjectCommand(uploadParams);
      await s3Client.send(uploadM3U8Command);

      const tsFiles = fs
        .readdirSync(resolutionDirectory)
        .filter((file) => file.endsWith(".ts"));
      for (const tsFile of tsFiles) {
        const tsFilePath = path.join(resolutionDirectory, tsFile);
        const tsFileData = fs.readFileSync(tsFilePath);

        const tsUploadParams = {
          Bucket: "stream-max-prod",
          Key: `${outputPrefix}/${tsFile}`,
          Body: tsFileData,
        };

        const uploadTSCommand = new PutObjectCommand(tsUploadParams);
        await s3Client.send(uploadTSCommand);
      }
    }
    try {
      const fileName = "master.m3u8";
      const textToWrite = `#EXTM3U
#EXT-X-VERSION:3
  
# Variants (different resolutions)
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/360p.m3u8
  
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
480p/480p.m3u8
  
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p/720p.m3u8
`;
      fs.writeFile(
        `/home/jay/StreamMax/server/videos/${title}/${fileName}`,
        textToWrite,
        (err) => {
          if (err) {
            console.error("Error writing to the file:", err);
          } else {
            console.log("File created and text written successfully.");
          }
        }
      );

      const uploadParams = {
        Bucket: "stream-max-prod",
        Key: `videos/${title}/${fileName}`,
        Body: textToWrite,
        ContentType: "application/vnd.apple.mpegurl",
      };

      const uploadClient = new PutObjectCommand(uploadParams);
      await s3Client.send(uploadClient);
    } catch (error) {
      console.log(error);
    }
    const dbVideoUrl = `https://stream-max-prod.s3.ap-south-1.amazonaws.com/videos/${title}/master.m3u8`;
    const obj = await Movie.findOne({ name: title });

    const finalObjAndUpdate = await Movie.findByIdAndUpdate(obj._id, {
      streamUrl: dbVideoUrl,
    });

    let finalObj = await Movie.findOne({ name: title });
    res.status(200).json({
      success: true,
      message: "Transcoding  completed",
      videoUrl: finalObj,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Transcoding  failed" });
  }
  const dir = "/home/jay/StreamMax/server/videos";
  fs.rmdir(dir, { recursive: true }, (err) => {
    if (err) {
      throw err;
    }

    console.log(`${dir} is deleted!`);
  });
});

export const test = asyncHandler(async (req, res) => {
  const title = "Iron_man";
});
