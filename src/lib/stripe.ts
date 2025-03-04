import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripe = await loadStripe(stripePublicKey);

export const createCheckoutSession = async (priceId: string) => {
  try {
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found. Please log in.');
    }

    // Call the Supabase Edge Function to create a checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { 
        priceId,
        customerId: session.user.id,
        customerEmail: session.user.email
      }
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL returned');

    // Redirect to the Stripe checkout page
    window.location.href = data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};