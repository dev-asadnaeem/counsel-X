exports.isLoggedIn = (req, res, next) => {
  try {
    if (!req.isLoggedIn) {
      return res.status(401).json({
        message: "Unauthorized: Please log in to access this resource",
        success: false,
      });
    } 
    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
