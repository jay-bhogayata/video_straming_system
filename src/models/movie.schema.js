import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "movie name is required"],
      unique: [true, "movie already exists"],
    },
    displayName: {
      type: String,
      required: [true, "movie name is required"],
    },
    year: {
      type: String,
    },
    imdbRating: {
      type: String,
    },
    userRating: {
      type: ["Number"],
    },
    userRatingList: {
      type: ["string"],
    },
    movieTime: {
      type: String,
    },
    shortIntro: {
      type: String,
      required: [true, "short intro is required"],
      maxLength: [500, "intro must be less then 150 characters."],
    },
    director: {
      type: String,
      required: [true, "director name is required"],
    },
    writers: {
      type: [String],
      required: [true, "writers name is required"],
    },
    cast: {
      type: [String],
      required: [true, "cast name is required"],
    },
    genre: {
      type: [String],
      required: [true, "genre is required"],
    },
    thumbnailImg: {
      type: String,
    },
    streamUrl: {
      type: String,
    },
    processingState: {
      type: String,
      enum: ["processing", "ideal", "processed"],
    },
    isPublished: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Movie", movieSchema);
