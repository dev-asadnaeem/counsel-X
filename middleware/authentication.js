const jwt = require("jsonwebtoken");
const client = require("../utils/redisDatabase");

exports.authentication = async (req, res, next) => {
  try {
    // Check if Authorization header is provided
    const token = req.header("Authorization");
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: Token not provided or malformed",
        success: false,
      });
    }

    // Extract JWT token by removing "Bearer " prefix
    const jwtToken = token.replace("Bearer ", "").trim();
    // Fetch user session from Redis
    const userSession = await client.get(jwtToken);
    if (!userSession) {
      return res.status(401).json({
        message: "Unauthorized: Session expired or invalid",
        success: false,
      });
    }

    // Parse session data
    const sessionData = JSON.parse(userSession);
    if (!sessionData.token || !sessionData.userData) {
      return res.status(401).json({
        message: "Unauthorized: Invalid session data",
        success: false,
      });
    }

    // Verify the token
    const decodedToken = jwt.verify(
      sessionData.token,
      process.env.JWT_SECRET_KEY
    );

    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({
        message: "Unauthorized: Missing user information in token",
        success: false,
      });
    }

    // Quick DB check to ensure user hasn't been disabled by an admin since the token was issued
    const User = require("../model/User");
    const dbUser = await User.findById(decodedToken.userId).select("status");
    
    if (!dbUser || dbUser.status === "disabled") {
      await client.del(jwtToken); // Remove invalid session from Redis
      return res.status(403).json({
        message: "Forbidden: User account has been disabled",
        success: false,
      });
    }

    // Attach user data and session info to the request object
    req.user = sessionData.userData;
    req.isLoggedIn = decodedToken.isLoggedIn;
    req.userId = sessionData.userData._id;

    // Proceed to the next middleware
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Session expired for a user (JWT expired).");
    } else {
      console.error("Authentication error:", error.message);
    }
    return res.status(401).json({
      message: "Unauthorized: Invalid token or session expired",
      success: false,
    });
  }
};
