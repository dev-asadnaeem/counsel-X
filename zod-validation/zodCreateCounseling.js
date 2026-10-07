const z = require("zod");

const createCounselingZodSchema = z.object({
  category: z
    .string()
    .min(1, { message: "Category is required and must be a string." })
    .max(50, { message: "Category must be at most 50 characters." }),
  duration: z
    .number({ invalid_type_error: "Expected number" }) // Custom message for type error
    .refine((val) => val === 45, {
      message: "Duration must be either 30 or 45 minutes.",
    }),
  price: z
    .number({ invalid_type_error: "Expected number" })
    .int({ message: "Price must be a whole number." }) // Ensures it's an integer
    .positive({ message: "Price must be a positive number." })
    .max(10000, { message: "Price should not exceed 10000." }), // Customize as per max range
});

module.exports = createCounselingZodSchema;
