import dbConnect from "@/backend/models/lib/mongodb";
import History from "@/backend/models/History";

export async function DELETE(request, { params }) {
  const { historyId } = await params;

  if (!historyId) {
    return new Response(JSON.stringify({ error: "History ID is required" }), { status: 400 });
  }

  await dbConnect();

  try {
    const history = await History.findByIdAndDelete(historyId);

    if (!history) {
      return new Response(JSON.stringify({ error: "History not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "History deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting history:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}