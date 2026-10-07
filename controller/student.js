const UserSchema = require("../model/User");
exports.getStudent = async (req, res) => {
  try {
    // Find the user by ID and populate both the student and counseling references
    const student = await UserSchema.find({
      role: "student",
    });

    // Check if the student profile exists
    if (!student) {
      return res
        .status(404)
        .json({ message: "students not found", success: false });
    }

    // Return the student profile data
    return res.status(200).json({
      data: student,
      success: true,
      message: "the student Profiles",
    });
  } catch (error) {
    // Return an error message in case of server issues
    return res.status(500).json({ message: "Server error", success: false });
  }
};
