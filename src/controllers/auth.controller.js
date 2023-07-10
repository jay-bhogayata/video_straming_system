import User from "../models/user.schema.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import mailHelper from "../utils/mailHelper.js";
import { createHash } from "node:crypto";

export const cookieOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
};

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

export const signup = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const otpByUser = createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({ email });

  if (user.otp === otpByUser && Date.now() < user.otpExpiry) {
    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: `user is verified with email ${user.email}`,
    });
  } else {
    await user.deleteOne();
    throw new CustomError("either otp is wrong or otp time expires.", 400);
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError("user does not exists", 400);
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (isPasswordMatch) {
    const token = user.getJWTToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      message: "login success",
      token,
      user,
    });
  }
  throw new CustomError("password is incorrect", 400);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "user logged out successfully.",
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new CustomError("user not found", 401);
  }

  res.status(200).json({
    success: true,
    user,
  });
});
