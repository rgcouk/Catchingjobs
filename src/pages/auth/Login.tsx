import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl="/user-portal" />
    </div>
  );
}
