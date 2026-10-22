import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
export default function Route() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/employee"
      signUpForceRedirectUrl="/employee"
    />
  );
}
