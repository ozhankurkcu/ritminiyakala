import { z } from 'zod';

export const signupSchema = z.object({
  displayName: z.string().min(2, 'Ad en az 2 karakter olmalı').max(50, 'Ad en fazla 50 karakter olabilir'),
  email:       z.string().email('Geçersiz e-posta adresi'),
  password:    z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path:    ['confirmPassword'],
});

export const loginSchema = z.object({
  email:    z.string().email('Geçersiz e-posta adresi'),
  password: z.string().min(1, 'Şifre gerekli'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Geçersiz e-posta adresi'),
});

export type SignupInput        = z.infer<typeof signupSchema>;
export type LoginInput         = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
