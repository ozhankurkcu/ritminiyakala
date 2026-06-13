const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use':  'Bu e-posta zaten kayıtlı.',
  'auth/invalid-email':         'Geçersiz e-posta adresi.',
  'auth/weak-password':         'Şifre en az 6 karakter olmalı.',
  'auth/user-not-found':        'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
  'auth/wrong-password':        'Şifre yanlış.',
  'auth/invalid-credential':    'E-posta veya şifre hatalı.',
  'auth/too-many-requests':     'Çok fazla deneme. Lütfen birkaç dakika bekleyin.',
  'auth/user-disabled':         'Bu hesap devre dışı bırakılmış.',
  'auth/popup-closed-by-user':  'Giriş penceresi kapatıldı. Tekrar deneyin.',
  'auth/cancelled-popup-request': 'Giriş iptal edildi.',
  'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
};

export function getAuthErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
}
