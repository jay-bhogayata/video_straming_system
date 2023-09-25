import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1/stream_db",
  JWT_SECRET: process.env.JWT_SECRET || "change_this_please",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  AWS_SES_USER_ACCESS_KEY: process.env.AWS_SES_USER_ACCESS_KEY,
  AWS_SES_USER_SECRET_ACCESS_KEY: process.env.AWS_SES_USER_SECRET_ACCESS_KEY,
  AWS_SES_REGION: process.env.AWS_SES_REGION,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY: process.env.AWS_SES_USER_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SES_USER_SECRET_ACCESS_KEY,
  STRIPE_kEY: process.env.STRIPE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};

export default config;
