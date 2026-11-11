import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'letter', label: 'One letter', test: (v: string) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  { id: 'special', label: 'One special character', test: (v: string) => /[^A-Za-z\d]/.test(v) },
];

export const signUpSchema = z.object({
  email,
  name: z.string().trim().min(3, 'Name must be at least 3 characters'),
  password: z.string().superRefine((value, ctx) => {
    const failed = passwordRules.find((rule) => !rule.test(value));
    if (failed) {
      ctx.addIssue({
        code: 'custom',
        message: `Password needs: ${failed.label.toLowerCase()}`,
      });
    }
  }),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
