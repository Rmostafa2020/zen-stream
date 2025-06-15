// pages/api/history/[userId].js
import dbConnect from "../../../lib/mongodb";
import History from "../../../models/History";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const history = await History.find({ user: userId })
      .sort({ date: -1 }) // Most recent first
      .populate("user", "userName email"); // Include user info

    res.status(200).json({
      message: "History retrieved successfully",
      history,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({
      error: "Failed to fetch history",
      details: error.message,
    });
  }
}
