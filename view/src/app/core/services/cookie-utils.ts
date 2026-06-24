const TOKEN_COOKIE = 'auth_token';

export function setTokenCookie(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax; Secure`;
}

export function getTokenCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeTokenCookie(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax; Secure`;
}
