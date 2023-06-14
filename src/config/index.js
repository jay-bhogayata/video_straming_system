import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1/stream_db",
  JWT_SECRET: process.env.JWT_SECRET || "change_this_please",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
};

export default config;
