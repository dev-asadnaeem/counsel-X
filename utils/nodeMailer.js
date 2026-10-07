const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.G_PASS,
  },
});

const sendMail = async (email, token = "", purpose = "", userId = "") => {
  if (!process.env.EMAIL || !process.env.G_PASS) {
    console.warn("Email/G_PASS env not set; skipping email send");
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const subjectLine =
    purpose === "student"
      ? "You Bought the Course"
      : purpose === "counselor"
      ? "A Student Bought a Course of Yours"
      : purpose === "verify"
      ? "Verify Your Email Address"
      : "Reset Your Password";

  const actionUrl =
    purpose === "verify"
      ? `${frontendUrl}/register/verify/${token}`
      : `${frontendUrl}/password-reset/${token}/${userId}`;

  // Plain text version — this is the #1 factor that prevents spam
  let textContent = "Hello,\n\n";
  if (purpose === "student") {
    textContent +=
      "Thank you for purchasing the course! You can access your course anytime by logging into your account.\n";
  } else if (purpose === "counselor") {
    textContent +=
      "A student has just purchased one of your courses! You can view the details in your dashboard.\n";
  } else if (purpose === "verify") {
    textContent +=
      "Please verify your email address by visiting the link below:\n\n" +
      actionUrl +
      "\n";
  } else {
    textContent +=
      "Please reset your password by visiting the link below:\n\n" +
      actionUrl +
      "\n";
  }
  textContent +=
    "\nIf you didn't request this, please ignore this email.\n";

  // HTML version — keeping it simple and close to original that worked
  const html = `
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td>
        <table width="600px" cellpadding="0" cellspacing="0" border="0" align="center" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background-color: #5cb85c; padding: 20px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">
                ${
                  purpose === "student"
                    ? "Course Purchase Confirmation"
                    : purpose === "counselor"
                    ? "Course Purchase Notification"
                    : purpose === "verify"
                    ? "Verify Your Email"
                    : "Reset Your Password"
                }
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Hello,</p>
              ${
                purpose === "student"
                  ? '<p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Thank you for purchasing the course! You can access your course anytime by logging into your account.</p>'
                  : purpose === "counselor"
                  ? '<p style="font-size: 16px; color: #333333; margin-bottom: 20px;">A student has just purchased one of your courses! You can view the details in your dashboard.</p>'
                  : purpose === "verify"
                  ? '<p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Please verify your email address by clicking the link below:</p>'
                  : '<p style="font-size: 16px; color: #333333; margin-bottom: 20px;">Please reset your password by clicking the link below:</p>'
              }
              ${
                purpose === "student" || purpose === "counselor"
                  ? ""
                  : `<p style="text-align: center; margin: 40px 0;">
                      <a
                        href="${actionUrl}"
                        style="display: inline-block; padding: 10px 20px; background-color: #5cb85c; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;"
                      >
                        ${
                          purpose === "verify"
                            ? "Verify Email"
                            : "Reset Password"
                        }
                      </a>
                    </p>`
              }
              <p style="font-size: 14px; color: #999999;">If you didn't request this, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
              &copy; ${new Date().getFullYear()} Counsel-X. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  </body>
  `;

  try {
    const info = await transporter.sendMail({
      from: `Counsel-X <${process.env.EMAIL}>`,
      to: email,
      subject: subjectLine,
      text: textContent,
      html: html,
    });
    console.log(`Email sent to ${email}: ${info.response}`);
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
};

module.exports = sendMail;
