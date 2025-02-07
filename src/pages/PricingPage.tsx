import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageSquare, Building2, Zap } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out our services',
    features: [
      '2 pieces of content per month',
      'Basic SEO optimization',
      'Standard support',
      'Access to essential tools'
    ],
    limit: 2,
    color: 'gray',
    stripePriceId: null
  },
  {
    name: 'Pro',
    price: '9.99',
    description: 'Great for small businesses and creators',
    features: [
      '20 pieces of content per month',
      'Advanced SEO optimization',
      'Priority support',
      'Access to all tools',
      'Content performance analytics'
    ],
    limit: 20,
    color: 'blue',
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID
  },
  {
    name: 'Business',
    price: '19.99',
    description: 'For growing businesses with higher content needs',
    features: [
      '50 pieces of content per month',
      'Premium SEO optimization',
      '24/7 priority support',
      'Advanced analytics',
      'Custom templates',
      'Team collaboration'
    ],
    limit: 50,
    color: 'purple',
    stripePriceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited content generation',
      'Custom AI model training',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'SLA guarantees'
    ],
    limit: null,
    color: 'indigo',
    stripePriceId: null,
    comingSoon: true
  }
];

export function PricingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (stripePriceId: string | null, planName: string) => {
    if (!session) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    if (!stripePriceId) {
      if (planName === 'Enterprise') {
        window.location.href = 'mailto:enterprise@example.com?subject=Enterprise Plan Inquiry';
        return;
      }
      return; // Free plan
    }

    try {
      setIsLoading(planName);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          customerId: session.user.id,
          customerEmail: session.user.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to create checkout session');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your content needs
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="mt-16 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.name === 'Pro' ? 'border-2 border-blue-500' : 'border border-gray-200'
              } bg-white`}
            >
              {plan.name === 'Pro' && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 transform rotate-45 bg-blue-500" />
                    <div className="relative px-3 py-1 text-xs font-semibold text-white transform rotate-45">
                      Popular
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.name === 'Pro' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Most Popular
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className="text-base font-medium text-gray-500">/month</span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  {plan.description}
                </p>

                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="ml-3 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <button
                    onClick={() => handleSubscribe(plan.stripePriceId, plan.name)}
                    disabled={plan.comingSoon || isLoading === plan.name}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                      plan.comingSoon || isLoading === plan.name
                        ? 'bg-gray-400 cursor-not-allowed'
                        : plan.name === 'Enterprise'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : plan.name === 'Pro'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      plan.name === 'Enterprise'
                        ? 'focus:ring-indigo-500'
                        : plan.name === 'Pro'
                        ? 'focus:ring-blue-500'
                        : 'focus:ring-purple-500'
                    }`}
                  >
                    {isLoading === plan.name ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </div>
                    ) : plan.comingSoon ? (
                      'Coming Soon'
                    ) : plan.name === 'Enterprise' ? (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Sales
                      </>
                    ) : plan.name === 'Free' ? (
                      'Get Started'
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Subscribe Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Need a custom solution?
          </h3>
          <div className="mt-4">
            <button
              onClick={() => handleSubscribe(null, 'Enterprise')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}