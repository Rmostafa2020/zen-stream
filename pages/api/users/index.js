// pages/api/users/index.js - Create new user
import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { userName, email, password } = req.body;

    // Validate required fields
    if (!userName || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields: userName, email, password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email or username already exists",
      });
    }

    // Create new user
    const user = new User({ userName, email, password });
    await user.save();

    // Return user without password
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
}
