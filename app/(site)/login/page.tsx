import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { GoogleSignInButton } from '@/components/site/auth-buttons';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

const ERRORS: Record<string, string> = {
  AccessDenied: 'Sign-in was cancelled or not allowed. Please try again.',
  Configuration: 'Sign-in is temporarily unavailable. Please try again later.',
  OAuthCallbackError: 'Google sign-in could not be completed. Please try again.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string; error?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  const callbackUrl = sp.callbackUrl?.startsWith('/') ? sp.callbackUrl : '/account';
  if (session?.user) redirect(session.user.role === 'ADMIN' && callbackUrl === '/account' ? '/admin' : callbackUrl);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-md border bg-white p-8 text-center sm:p-10" data-testid="login-card">
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-3 text-4xl text-charcoal">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Browsing is open to everyone — sign in only to access your account and future order history.
        </p>
        {sp.error && (
          <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="login-error">
            {ERRORS[sp.error] || 'Something went wrong. Please try again.'}
          </p>
        )}
        <div className="mt-8">
          <GoogleSignInButton callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">We only use your name and email to create your account.</p>
      </div>
    </div>
  );
}
