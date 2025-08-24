'use client';

import AuthForm from '@/components/auth-form';
import { Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Bot className="h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl font-bold text-center">Financial Analysis AI</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
