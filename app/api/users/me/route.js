import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";

export async function GET(request) {
  const { userId } = getAuth(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await dbConnect();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  return new Response(
    JSON.stringify({
      id: user._id,
      userName: user.userName,
      email: user.email,
      clerkId: user.clerkId,
      createdAt: user.createdAt,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}