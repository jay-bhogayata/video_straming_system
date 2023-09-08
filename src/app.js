import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/index.js";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import config from "./config/index.js";
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5500"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(fileUpload());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.status(200);
  res.json({
    message: "backend is working fine...",
  });
});

const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).json({ error: "No video uploaded" });
  }

  const uploadedVideo = req.files.video;
  // console.log(req.body.title, uploadedVideo);
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
      message: "Upload successful",
      videoUrl: videoUrl,
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Upload failed" });
  }

  // Call the transcoding API
  try {
    const response = await fetch("http://localhost:3001/transcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoUrl: videoUrl, // Pass the temporary video URL
        title: req.body.title, // Pass the video title
      }),
    });

    if (response.ok) {
      const transcodingResponse = await response.json();
      console.log("Transcoding started:", transcodingResponse);
    } else {
      console.error("Transcoding API failed");
    }
  } catch (error) {
    console.error("Error calling transcoding API:", error);
  }

  // Return success response to the user
  res.status(200).json({
    message: "Upload successful",
    videoUrl: temporaryVideoUrl,
  });
});

app.post("/transcode", async (req, res) => {
  try {
    const title = "test";
    const videoUrl =
      "https://stream-max-temp-01.s3.ap-south-1.amazonaws.com/videos/test.mp3";

    // Define the resolutions and corresponding bitrates
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
      // Run the transcoding command using a child_process library
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

    res.status(200).json({ message: "Transcoding  completed" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Transcoding  failed" });
  }
});

// "https://stream-max-temp-01.s3.ap-south-1.amazonaws.com/videos/test.mp3";

// if no route is matched by now, it must be a 404
app.all("*", (_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
