const z = require("zod");


const UserSchemaZod = z
  .object({
    personalInfo: z.object({
      name: z
        .string({ message: "Name is required!" })
        .min(2, { message: "Name must be at least 2 characters." })
        .max(50, { message: "Name must be at most 50 characters." })
        .regex(/^[A-Za-z\s'-]+$/, { message: "Name can only contain letters, spaces, hyphens and apostrophes." })
        .trim(),
      email: z
        .string({ message: "Email is required!" })
        .email({ message: "Invalid email format." })
        .trim(),
      password: z
        .string({ message: "Password is required!" })
        .min(8, { message: "Password must be at least 8 characters." })
        .max(128, { message: "Password must be at most 128 characters." })
        // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        // .regex(/[0-9]/, { message: "Password must contain at least one number." })
        // .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character (@, $, !, %, *, ?, &)." })
        .trim(),
      confirmPassword: z
        .string({ message: "Confirm Password is required!" })
        .min(7, { message: "Password must be at least 7 characters." })
        .max(255, { message: "Password must be at most 255 characters." }),
    }),
    role: z.string().trim(),
    profile: z.string().trim().optional(),
    counseling: z.string().optional(),
    counselor: z.string().optional(),
    friends: z.array(z.string()).optional(),
  })
  .refine((data) => data.personalInfo.password === data.personalInfo.confirmPassword, {
    message: "Passwords do not match!",
    path: ["personalInfo", "confirmPassword"], // Set the error path to confirmPassword
  });

module.exports = UserSchemaZod;
