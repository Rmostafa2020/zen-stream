import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";

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
    const { id } = event.data;
    await User.findOneAndDelete({ clerkId: id });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}