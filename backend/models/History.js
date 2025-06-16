// models/History.js
import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    podcast: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite during hot reload
const History =
  mongoose.models.History || mongoose.model("History", historySchema);

export default History;
