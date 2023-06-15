import User from "../models/user.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import mailHelper from "../utils/mailHelper.js";
import { createHash } from "node:crypto";

export const sendSignUpOtp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ((!name, !email, !password)) {
    throw new CustomError("please add all required fields", 400);
  }

  const exitUser = await User.findOne({ email });

  if (exitUser) {
    throw new CustomError("user already exists", 400);
  }
  const user = await User.create({
    name,
    email,
    password,
  });

  const otp = user.generateOtp();

  const message = `your otp for signup with stream max is ${otp}  . it is valid for 10 min.`;

  await user.save();

  try {
    await mailHelper({
      email: email,
      subject: "signup otp for stream max",
      text: message,
    });
    res.status(200).json({
      success: true,
      message: `otp send successfully to ${user.email}`,
    });
  } catch (error) {
    await user.deleteOne();
    throw new CustomError(
      `failed to send mail${error.message} try to create account again.`,
      400
    );
  }
});
