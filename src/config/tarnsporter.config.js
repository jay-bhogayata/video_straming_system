import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import config from "./index.js";

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: config.AWS_SES_REGION,
  credentials: {
    accessKeyId: config.AWS_SES_USER_ACCESS_KEY,
    secretAccessKey: config.AWS_SES_USER_SECRET_ACCESS_KEY,
  },
});

const transporter = nodemailer.createTransport({
  SES: { aws, ses },
});

export default transporter;
