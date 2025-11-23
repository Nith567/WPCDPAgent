"use client";

import { useState } from "react";
import { SignInModal } from "@coinbase/cdp-react";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import CustomAuthComponent from "./CustomAuthComponent";


export default function WPX402SignIn() {
    const { isSignedIn } = useIsSignedIn();
  return (
    <div className="relative h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
        {/* Logo/Brand Section */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            WP<span className="text-blue-600">x402</span>
          </h1>
          
          <div className="shimmer-text text-xl text-gray-600 mb-6 font-medium">
            Monetize Your Content with Micropayments
          </div>
          
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-5 py-3 rounded-full text-sm font-semibold border-2 border-blue-200 shadow-sm">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            Earn with <span className="font-bold ml-1">x402 Micropayments</span>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-left">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Payments</h3>
            <p className="text-xs text-gray-600">Get paid in real-time</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure</h3>
            <p className="text-xs text-gray-600">Blockchain powered</p>
          </div>


          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Fast Setup</h3>
            <p className="text-xs text-gray-600">Start in minutes</p>
          </div>
        </div>



        <CustomAuthComponent />
       

        {/* Footer Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Powered by <span className="font-semibold text-blue-600">Coinbase</span> • <span className="font-semibold text-gray-700">x402</span> • <span className="font-semibold text-gray-700">0G Network</span></p>
          <p className="text-gray-400">Secure WordPress content monetization platform</p>
        </div>
      </div>
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        .shimmer-text {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
