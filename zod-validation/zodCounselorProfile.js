const z = require("zod");

const CounselorProfileSchemaZod = z.object({
  education: z.object({
    degree: z
      .string()
      .min(2, { message: "Degree must be at least 2 characters." })
      .max(100, { message: "Degree must be at most 100 characters." })
      .trim(),
    institution: z
      .string()
      .min(2, { message: "Institution must be at least 2 characters." })
      .max(100, { message: "Institution must be at most 100 characters." })
      .trim(),
    experience: z
      .string()
      .min(1, { message: "Experience must be at least 1 character." })
      .max(50, { message: "Experience must be at most 50 characters." })
      .trim(),
    description: z
      .string()
      .min(10, { message: "Description must be at least 10 characters." })
      .max(500, { message: "Description must be at most 500 characters." })
      .trim(),
  }),
  payment: z.object({
    accountNumber: z
      .string()
      .min(10, { message: "Account number must be at least 10 characters." })
      .max(20, { message: "Account number must be at most 20 characters." })
      .trim(),
    bankName: z
      .string()
      .min(2, { message: "Bank name must be at least 2 characters." })
      .max(100, { message: "Bank name must be at most 100 characters." })
      .trim(),
    branchCode: z
      .string()
      .min(3, { message: "Branch code must be at least 3 characters." })
      .max(20, { message: "Branch code must be at most 20 characters." })
      .trim(),
  }),
  counseling: z.object({
    category: z.string().min(1, { message: "Category is required." }),
    duration: z.number().min(1, { message: "Duration is required." }),
    price: z.string().min(1, { message: "Price is required." }),
  }),
  file: z
    .string()
    .trim()
    .min(5, { message: "File path must be at least 5 characters." })
    .max(255, { message: "File path must be at most 255 characters." })
    .optional(),
});

module.exports = CounselorProfileSchemaZod;
