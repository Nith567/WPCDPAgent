"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import USDCDashboard from "./WPX402Dashboard";
import WPX402SignIn from "./WPX402SignIn";

export default function Home() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading WPx402...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isSignedIn && <WPX402SignIn />}
      {isSignedIn && <USDCDashboard />}
    </>
  );
}
