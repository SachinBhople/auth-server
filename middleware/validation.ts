import {z} from "zod"

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required."),
    email: z.string().email("Invalid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters."),
    mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile must be a valid 10-digit number."),
    hero: z.string().optional(), // Optional for file uploads
    role: z.string().optional(), // Optional for file uploads
  });

  export const loginSchema = z.object({
    email: z
      .string()
      .email("Invalid email address.")
      .optional(), // Allow either email or mobile
    mobile: z
      .string()
      .regex(/^\d{10}$/, "Mobile must be a valid 10-digit number.")
      .optional(),
    password: z.string().min(8, "Password is required."),
  }).refine(
    (data) => data.email || data.mobile,
    {
      message: "Either email or mobile is required.",
      path: ["email"], // Focus error on email if both are missing
    }
  );
  