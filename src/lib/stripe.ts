import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripe = await loadStripe(stripePublicKey);

export const createCheckoutSession = async (priceId: string) => {
  try {
    const { data: { sessionId }, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId }
    });

    if (error) throw error;

    const result = await stripe?.redirectToCheckout({
      sessionId
    });

    if (result?.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};