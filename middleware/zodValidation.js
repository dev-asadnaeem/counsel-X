exports.zodRegistrationValidation =
  (userSchema, counselorSchema) => (req, res, next) => {
    try {
      // Handle both string and object formats
      const body = typeof req.body.registerUser === 'string'
        ? JSON.parse(req.body.registerUser)
        : req.body.registerUser;
      const { role } = body;
      if (role === "student") {
        // Validate user data for student role
        const userValidation = userSchema.parse(body);
        req.body.registerUser = userValidation;
        return next();
      } else if (role === "counselor") {
        const { personalInfo, education, payment, counseling, role } = body;
        // Validate both user and counselor data
        const userValidation = userSchema.parse({ personalInfo, role });

        // Counselor data is nested under the root object
        const counselorValidation = counselorSchema.parse({
          education,
          payment,
          counseling,
        });
        req.body.registerUser = {
          personalInfo: userValidation.personalInfo,
          role: userValidation.role,
          education: counselorValidation.education,
          payment: counselorValidation.payment,
          counseling: counselorValidation.counseling,
        };
        return next();
      }
    } catch (err) {
      console.log("Validation error in Zod:", err);
      return res.status(400).json({
        message: err.errors && err.errors[0] ? err.errors[0].message : err.message || "Validation error",
        success: false,
      });
    }
  };

exports.zodValidation = (schema) => (req, res, next) => {
  try {
    const body = req.body;

    // Only parse `startDate`, if it exists
    if (body.startDate) {
      const validatedData = schema.parse({ startDate: body.startDate });
      const validatedDate = validatedData.startDate;

      // Assign `startDate` back to `req.body` after validation
      req.body = { ...body, startDate: validatedDate };
      return next();
    }

    // If `startDate` is not present, pass the original body through
    req.body = body;
    return next();
  } catch (err) {
    return res.status(400).json({
      message: err.errors[0].message + " - Validation failed for startDate",
      success: false,
    });
  }
};
