import { z } from "zod";

// Client-side checks for UX only; fleetflow-api validates again (password rules live there).
const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .pipe(z.email("Enter a valid email address, like name@company.com"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(256, "Password must be 256 characters or fewer"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(1, "Enter a new password").max(256, "Password must be 256 characters or fewer"),
    confirmPassword: z.string().min(1, "Enter the password again"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
