// const CounselorSchema = require("../model/Counselor");
const CreateCounseling = require("../model/CreateCounseling");
const UserSchema = require("../model/User");
const client = require("../utils/redisDatabase");
exports.getCounselor = async (req, res) => {
  try {
    // Fetch ALL counselors who are active — with or without a counseling package
    const counselor = await UserSchema.find({
      role: "counselor",
      status: { $ne: "disabled" },
    })
      .populate("counselor")   // Populate counselor profile
      .populate("counseling"); // Populate counseling package (may be null)

    return res.status(200).json({
      data: counselor,
      success: true,
      message: "the counselor Profiles",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.postCAdvice = async (req, res) => {
  try {
    const userId = req.user._id;
    const { counselorId } = req.body;

    if (req.user.role === "counselor" || req.user.role === "admin") {
      return res.status(403).json({
        message: `You can't add counselor as ${req.user.role}`,
        success: false,
      });
    }

    // Add user to counselor's students list
    await UserSchema.findByIdAndUpdate(counselorId, {
      $addToSet: { friends: userId },
    });

    // Add counselor to user's counselor list
    const user = await UserSchema.findByIdAndUpdate(userId, {
      $addToSet: { friends: counselorId },
    }, { new: true });

    // Update Redis Cache for the current user purchasing advice
    const token = req.header("Authorization");
    if (token) {
      const jwtToken = token.replace("Bearer ", "").trim();
      const userSession = await client.get(jwtToken);
      if (userSession) {
        const sessionData = JSON.parse(userSession);
        sessionData.userData = user;
        await client.set(jwtToken, JSON.stringify(sessionData), "EX", 259200);
      }
    }

    return res.status(200).json({
      message: "Advice purchased successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.postCreateCounseling = async (req, res, next) => {
  try {
    const { category, duration, price } = req.body;
    const userId = req.user._id;

    const findCounseling = await CreateCounseling.findOne({
      counselorId: userId,
    });

    if (findCounseling) {
      return res
        .status(409)
        .json({ message: "this is already exist", success: false });
    }
    const counseling = new CreateCounseling({
      counselorId: userId,
      category,
      duration,
      price,
    });

    const findUser = await UserSchema.findById(userId);
    findUser.counseling = counseling._id;
    await findUser.save();
    await counseling.save();

    // Update Redis Cache for the counselor who created counseling
    const token = req.header("Authorization");
    if (token) {
      const jwtToken = token.replace("Bearer ", "").trim();
      const userSession = await client.get(jwtToken);
      if (userSession) {
        const sessionData = JSON.parse(userSession);
        sessionData.userData = findUser;
        await client.set(jwtToken, JSON.stringify(sessionData), "EX", 259200);
      }
    }

    return res
      .status(200)
      .json({ message: "counseling Created", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

exports.getUCounselors = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await UserSchema.findById(userId)
      .populate("friends")
      .populate("counselor")
      .populate("counseling");
    return res
      .status(200)
      .json({ data: user, success: true, message: "User Friends list" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: true });
  }
};
