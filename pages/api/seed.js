// pages/api/seed.js
import dbConnect from "../../backend/models/lib/mongodb";
import User from "../../backend/models/User";
import History from "../../backend/models/History";

export default async function handler(req, res) {
  // Connect to MongoDB
  await dbConnect();

  try {
    // Step 1: Create a user
    const user = new User({
      userName: "Alice23",
      email: "alice@example.com",
      password: "password123",
    });
    await user.save();

    // Step 2: Save a podcast history for that user
    const history = new History({
      user: user._id,
      title: "Anxiety and Mental Health",
      podcast: "something in the transcript",
      date: new Date(),
    });
    await history.save();

    // Return success response
    res.status(200).json({
      message: "User and podcast history saved successfully.",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
      history: {
        id: history._id,
        title: history.title,
        podcast: history.podcast,
        date: history.date,
      },
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Failed to save data",
      details: err.message,
    });
  }
}
