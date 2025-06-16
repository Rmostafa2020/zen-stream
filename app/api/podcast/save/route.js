import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import History from '@/models/History';

/**
 * API route to save a new podcast history entry for the authenticated user.
 * @param {Request} request - The incoming HTTP request.
 * @returns {NextResponse} - The response object.
 */
export async function POST(request) {
  // 1. Authenticate the user using Clerk
  // The `auth()` helper provides the session information for the logged-in user.
  const { userId: clerkId } = auth();

  // If there's no clerkId, the user is not authenticated.
  if (!clerkId) {
    return new NextResponse(
      JSON.stringify({ error: 'User not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 2. Parse the request body
    // We expect the client to send a JSON object with 'title' and 'script'.
    const { title, script } = await request.json();

    // Basic validation to ensure required fields are present.
    if (!title || !script) {
      return new NextResponse(
        JSON.stringify({ error: 'Title and script are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Connect to the database
    await dbConnect();

    // 4. Find the internal user record
    // We need to find the user in our own 'users' collection that corresponds
    // to the authenticated Clerk user. This gives us the MongoDB `_id` for referencing.
    const user = await User.findOne({ clerkId });

    // If no user is found, it means the user exists in Clerk but not in our
    // local database. This can happen if the user creation webhook failed.
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found in database' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create and save the new history entry
    // A new `History` document is created with the data.
    // The `user` field is set to the MongoDB `_id` of our local user.
    // The `script` from the request is saved to the `podcast` field in the schema.
    const newHistoryEntry = new History({
      user: user._id, // Reference to the User document's ObjectId
      title: title,
      podcast: script, // Mapping 'script' from request to 'podcast' field
    });

    await newHistoryEntry.save();

    // 6. Return a success response
    // A 201 status code ("Created") is appropriate here.
    return new NextResponse(
      JSON.stringify({ 
        message: 'Podcast history saved successfully',
        historyId: newHistoryEntry._id 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 7. Handle any errors
    console.error("Error saving podcast history:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to save podcast history' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
