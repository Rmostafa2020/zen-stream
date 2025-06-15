require("./db"); // Connect to MongoDB
const User = require("./models/User");
const History = require("./models/History");

async function saveExampleData() {
  try {
    // Step 1: Create a user
    const user = new User({
      userName: "Alice23",
      email: "alice@example.com",
      password: "password123",
    });
    await user.save();

    // Step 2: Save a podcast history for that user
    const history = new History({
      user: user._id,
      title: "Anxiety and Mental Health",
      podcast: "soemthing in the transcript", 
      date: new Date(),
    });
    await history.save();

    console.log("User and podcast history saved successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}

saveExampleData();
