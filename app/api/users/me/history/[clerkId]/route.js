//given a clerk id from frontend I have to fetch the user's mongoDB _id from mongoDB  then use that _id to delete the podcast history document from mongoDB
// app/api/users/me/history/[clerkId]/route.js
import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";
import History from "@/backend/models/History";


// Common error response handler
const errorResponse = (message, status) => 
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

export async function GET(request, { params }) {
  try {
    const { clerkId } = await params;
    
    if (!clerkId) return errorResponse("Clerk ID required", 400);

    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) return errorResponse("User not found", 404);

    const history = await History.find({ user: user._id })
      .select('_id title')  // Only include these fields
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error fetching history:", error);
    return errorResponse("Internal server error", 500);
  }
}


export async function DELETE(request, { params }) {
  try {
    const { clerkId } = await params;

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Clerk ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await dbConnect();

    // 1. Find user by Clerk ID
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Delete all history entries for this user
    const result = await History.deleteMany({ user: user._id });

    return new Response(JSON.stringify({
      message: "History deleted successfully",
      deletedCount: result.deletedCount
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error deleting history:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
