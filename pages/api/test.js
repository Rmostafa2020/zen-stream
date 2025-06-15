// pages/api/test.js
import dbConnect from "@/backend/models/lib/mongodb";

export default async function handler(req, res) {
  await dbConnect();

  res.status(200).json({ message: "Connected to MongoDB Atlas from Next.js!" });
}
