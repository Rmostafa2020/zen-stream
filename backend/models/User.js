// models/User.js
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);


// Prevent model overwrite
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
