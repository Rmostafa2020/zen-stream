//I need to make a route that fetches history document from mongoDB given the _id of history and returns the history data.
//GET IS BASED ON THE ID OF THE HISTORY DOCUMENT
import dbConnect from "@/backend/models/lib/mongodb";
import History from "@/backend/models/History";
export async function GET(request, { params }) {

  const { historyId } = params;

  if (!historyId) {
    return new Response(JSON.stringify({ error: "History ID is required" }), { status: 400 });
  }

  await dbConnect();

  try {
    const history = await History.findById(historyId);

    if (!history) {
      return new Response(JSON.stringify({ error: "History not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}