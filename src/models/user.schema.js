import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SubscriptionType from "../utils/SubTypes.js";
import AuthRoles from "../utils/AuthRoles.js";
import config from "../config/index.js";
import { createHash, randomBytes } from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      maxLength: [20, "name must be less then 20 characters."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email address is already registered with services"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "password must be at least 8 characters long."],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: "USER",
    },
    subscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SubscriptionType),
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods = {
  comparePassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  getJWTToken: function () {
    return jwt.sign({ _id: this.id, role: this.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY,
    });
  },

  generateForgotPasswordToken: function () {
    const forgotToken = randomBytes(20).toString("hex");

    this.forgotPasswordToken = createHash("sha256")
      .update(forgotToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

    return forgotToken;
  },

  generateOtp: function () {
    const otp = randomBytes(3).toString("hex");

    this.otp = createHash("sha256").update(otp).digest("hex");

    this.otpExpiry = Date.now() + 10 * 60 * 1000;

    return otp;
  },
};

const User = mongoose.model("User", userSchema);

export default User;
