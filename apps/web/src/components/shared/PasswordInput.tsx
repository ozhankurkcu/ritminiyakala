'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Şifre alanı + göster/gizle göz ikonu.
 * react-hook-form ile uyumlu: {...register('password')} spread edilebilir (ref forward edilir).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className = '', ...props }, ref) {
    const [show, setShow] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={`input-base pr-11 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
          aria-pressed={show}
          title={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-fume hover:text-primary-700 transition-colors focus:outline-none focus-visible:text-primary-700"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    );
  }
);
