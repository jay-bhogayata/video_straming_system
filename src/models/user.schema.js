import mongoose from "mongoose";
import SubscriptionType from "../utils/SubTypes.js";
import AuthRoles from "../utils/AuthRoles.js";

const userSchema = new Schema(
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
      maxLength: [24, "password length can not be more then 24 characters."],
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: "user",
    },
    subscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SubscriptionType),
      default: AuthRoles.USER,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: Number,
    otpExpiry: Date,
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
