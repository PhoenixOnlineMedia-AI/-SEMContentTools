import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

export function SubscriptionSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to home if no session ID is present
    if (!sessionId) {
      navigate('/');
      return;
    }

    // Verify the subscription was successful
    const verifySubscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait a moment to allow webhook processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to home page after verification
        navigate('/');
      } catch (error: any) {
        console.error('Error verifying subscription:', error);
        setError(error.message || 'Failed to verify subscription');
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      verifySubscription();
    }
  }, [sessionId, navigate, session]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Subscription Successful!
        </h2>
        {isLoading ? (
          <div className="mt-4">
            <p className="text-gray-600">Processing your subscription...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        ) : error ? (
          <div className="mt-4">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-gray-600">
              Thank you for subscribing to SEM Content Tools! Your subscription has been processed successfully.
            </p>
            <p className="mt-2 text-gray-600">
              You now have access to all premium features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 