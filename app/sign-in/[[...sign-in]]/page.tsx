import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <SignIn />
    </div>
  );
}