import dbConnect from "@/backend/models/lib/mongodb";
import User from "@/backend/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const event = req.body;

  if (event.type === "user.created") {
    const { id, email_addresses, username } = event.data;
    const email = email_addresses[0]?.email_address;

    // Create user in MongoDB if not exists
    await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          userName: username || email,
          email,
          password: "clerk", // Or leave blank/null if not used
          clerkId: id,
        },
      },
      { upsert: true, new: true }
    );
  }

  // Handle other events as needed

  res.status(200).json({ received: true });
}