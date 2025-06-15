// pages/api/history/index.js - Save podcast history
import dbConnect from "../../../lib/mongodb";
import History from "../../../models/History";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { userId, title, podcast } = req.body;

    // Validate required fields
    if (!userId || !title || !podcast) {
      return res.status(400).json({
        error: "Missing required fields: userId, title, podcast",
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create new history entry
    const history = new History({
      user: userId,
      title,
      podcast,
      date: new Date(),
    });

    await history.save();

    res.status(201).json({
      message: "Podcast history saved successfully",
      history: {
        id: history._id,
        title: history.title,
        podcast: history.podcast,
        date: history.date,
        user: history.user,
      },
    });
  } catch (error) {
    console.error("Error saving history:", error);
    res.status(500).json({
      error: "Failed to save podcast history",
      details: error.message,
    });
  }
}
