import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple email sending function
async function sendEmail(to: string, subject: string, body: string) {
  try {
    // In a production environment, you would integrate with an email service
    // like SendGrid, Mailgun, or AWS SES
    console.log(`Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    
    // For now, we'll just log the email details
    // In the future, implement actual email sending here
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the webhook
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    // Construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Subscription created:', subscription.id);
    
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    if (!customer || customer.deleted) {
      throw new Error('Customer not found or deleted');
    }
    
    // Get the user ID from customer metadata
    const userId = customer.metadata?.supabase_user_id;
    if (!userId) {
      throw new Error('User ID not found in customer metadata');
    }
    
    // Update the user's subscription in the database
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        id: subscription.id,
        user_id: userId,
        customer_id: subscription.customer,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        quantity: subscription.items.data[0].quantity,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        created_at: new Date(subscription.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      throw error;
    }
    
    // Send welcome email to the customer
    if (customer.email) {
      await sendEmail(
        customer.email,
        'Welcome to SEM Content Tools!',
        `Thank you for subscribing to SEM Content Tools! Your subscription is now active.
        
You can now create content with our AI-powered tools. If you have any questions, please contact our support team.

Best regards,
The SEM Content Tools Team`
      );
    }
    
    console.log('Subscription created successfully for user:', userId);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Subscription updated:', subscription.id);
    
    // Update the subscription in the database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
        quantity: subscription.items.data[0].quantity,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
    
    if (error) {
      throw error;
    }
    
    console.log('Subscription updated successfully:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Subscription deleted:', subscription.id);
    
    // Update the subscription status in the database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
    
    if (error) {
      throw error;
    }
    
    console.log('Subscription marked as deleted:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    console.log('Checkout completed:', session.id);
    
    // If this is a subscription checkout, the subscription will be handled by the subscription.created event
    if (session.mode === 'subscription') {
      console.log('Subscription checkout completed, waiting for subscription.created event');
      
      // Get customer details
      const customer = await stripe.customers.retrieve(session.customer);
      if (!customer || customer.deleted) {
        throw new Error('Customer not found or deleted');
      }
      
      // Send welcome email to the customer
      if (customer.email) {
        await sendEmail(
          customer.email,
          'Thank you for your purchase!',
          `Thank you for subscribing to SEM Content Tools! Your subscription is being processed.
          
You will receive another email once your subscription is fully activated.

Best regards,
The SEM Content Tools Team`
        );
      }
    }
    
    console.log('Checkout completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
} 