import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";
import History from "@/backend/models/History";

export async function POST(request) {
  await dbConnect();

  const event = await request.json();
  console.log("Webhook received", event); // <-- Add this line

  if (event.type === "user.created") {
    const { id, email_addresses, username } = event.data;
    const email = email_addresses[0]?.email_address;

    await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          userName: username || email,
          email,
          clerkId: id,
        },
      },
      { upsert: true, new: true }
    );
  }

  if (event.type === "user.updated") {
    const { id, email_addresses, username } = event.data;
    const email = email_addresses[0]?.email_address;

    await User.findOneAndUpdate(
      { clerkId: id },
      {
        userName: username || email,
        email,
      }
    );
  }

  if (event.type === "user.deleted") {
    const { id: clerkId } = event.data;

    // First, find the user by clerkId
    const user = await User.findOne({ clerkId });

    if (user) {
      // Delete all history documents related to this user
      await History.deleteMany({ user: user._id });

      // Then delete the user document itself
      await User.findOneAndDelete({ clerkId });
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
