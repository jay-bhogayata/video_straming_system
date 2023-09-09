import { Router } from "express";
import {
  addMovie,
  transcode,
  uploadVideo,
  getMovie,
  getMovieById,
  deleteMovieById,
  test,
  thumbImgUpload,
  updateMovieById,
} from "../controllers/video.controller.js";

const router = new Router();

router.post("/addMovie", addMovie);
router.put("/updateMovieById/:id", updateMovieById);
router.get("/getAllMovie", getMovie);
router.post("/upload", uploadVideo);
router.post("/transcode", transcode);
router.get("/getMovieById/:id", getMovieById);
router.delete("/deleteMovieById/:id", deleteMovieById);
router.post("/thumbImgUpload", thumbImgUpload);

export default router;
