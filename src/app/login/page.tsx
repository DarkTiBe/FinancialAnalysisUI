import AuthForm from '@/components/auth-form';
import { Bot } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Bot className="h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl font-bold text-center">TradeSage AI</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Welcome back! Please sign in to your account.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
