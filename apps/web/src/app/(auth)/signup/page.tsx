'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validators';
import { authService } from '@/modules/auth/authService';
import { getAuthErrorMessage } from '@/modules/auth/authErrors';
import { PasswordInput } from '@/components/shared/PasswordInput';

export default function SignupPage() {
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setError('');
    setLoading(true);
    try {
      await authService.signupWithEmail(data.email, data.password, data.displayName);
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
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-primary-700 mb-2">
            Hesabın Oluşturuldu!
          </h1>
          <p className="text-brand-fume mb-2">
            Doğrulama e-postası gönderildi. Gelen kutunu kontrol et.
          </p>
          <p className="text-sm text-brand-fume mb-6">
            E-postayı onaylamadan da devam edebilirsin.
          </p>
          <Link href="/login" className="btn-primary btn-lg w-full block text-center no-underline text-white mb-3">
            Giriş Yap → Kurulumu Tamamla
          </Link>
          <p className="text-xs text-brand-fume">
            Giriş yaptıktan sonra spor tercihlerini belirleme adımına yönlendirileceksin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-extrabold text-primary-700 mb-1">
            ritminiyakala
          </h1>
          <p className="text-brand-fume">Hesap oluştur</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} method="post" noValidate className="space-y-4">
          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Ad Soyad <span className="text-status-error">*</span>
            </label>
            <input
              {...register('displayName')}
              type="text"
              placeholder="Adın Soyadın"
              className="input-base"
              autoComplete="name"
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-status-error">{errors.displayName.message}</p>
            )}
          </div>

          {/* E-posta */}
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              E-posta <span className="text-status-error">*</span>
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

          {/* Şifre */}
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Şifre <span className="text-status-error">*</span>
            </label>
            <PasswordInput
              {...register('password')}
              placeholder="En az 6 karakter"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-error">{errors.password.message}</p>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Şifre Tekrar <span className="text-status-error">*</span>
            </label>
            <PasswordInput
              {...register('confirmPassword')}
              placeholder="Şifreni tekrar gir"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-status-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Genel Hata */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-status-error">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-secondary btn-lg w-full mt-2"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-brand-fume mt-6">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-brand-intLink font-semibold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
