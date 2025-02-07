import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow text-center">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-gray-600">
          We've sent a verification link to{' '}
          <span className="font-medium text-gray-900">{email}</span>
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to verify your account.
          The link will expire in 24 hours.
        </p>
        <div className="mt-4">
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}