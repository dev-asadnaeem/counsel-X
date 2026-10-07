const client = require("../utils/redisDatabase");

exports.getUserStatus = async (req, res, next) => {
  try {
    const { Id: chatUserId } = req.params; // Extract the user ID from the request parameters

    // Fetch user status from Redis
    const userStatus = await client.get(chatUserId);
    if (!userStatus) {
      // User exists but no status found
      return res.status(200).json({
        message: "User exists but no status found",
        data: { status: "offline" }, // Default to 'offline' if no status is found
        success: true, // The request succeeded but status is not available
      });
    }

    // User status found 
    return res.status(200).json({
      msg: "User status retrieved successfully",
      data: JSON.parse(userStatus), // Parse Redis data if needed
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user status:", error.message); // Log the error

    // Handle any unexpected errors
    return res.status(500).json({
      message: "An error occurred while fetching user status",
      success: false,
    });
  }
};
