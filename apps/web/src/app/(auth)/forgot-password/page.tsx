'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';
import { authService } from '@/modules/auth/authService';
import { getAuthErrorMessage } from '@/modules/auth/authErrors';

export default function ForgotPasswordPage() {
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError('');
    setLoading(true);
    try {
      await authService.sendPasswordReset(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(getAuthErrorMessage(code));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-primary-700 mb-2">
            E-posta Gönderildi
          </h2>
          <p className="text-brand-fume mb-6">
            <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
          </p>
          <Link href="/login" className="btn-primary btn-md w-full block text-center">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-primary-700 mb-1">
            Şifreni Sıfırla
          </h1>
          <p className="text-brand-fume text-sm">
            E-posta adresini gir, sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              E-posta
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="ornek@mail.com"
              className="input-base"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-error">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-lg w-full"
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>

        <p className="text-center text-sm text-brand-fume mt-6">
          <Link href="/login" className="text-brand-intLink font-semibold hover:underline">
            ← Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}
