# Stripe Setup Instructions

## Setting up Stripe API Keys in Supabase

To ensure the Stripe webhook function works correctly, you need to set up the following environment variables as Supabase Edge Function secrets:

```bash
# Set your Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key

# Set your Stripe publishable key
supabase secrets set STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# You'll need to set the webhook secret after creating the webhook endpoint in Stripe
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Set your Supabase URL and service role key (if needed)
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deploying the Stripe Webhook Function

The Stripe webhook function has been successfully deployed. If you need to redeploy it in the future, use:

```bash
supabase functions deploy stripe-webhook
```

## Setting up the Stripe Webhook Endpoint

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your Supabase function URL: `https://your-project-ref.functions.supabase.co/stripe-webhook`
4. Select the following events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## Stripe Products and Pricing Plans

The following products and pricing plans have been set up in Stripe:

### Pro Plan
- Price: $9.99/month
- Features:
  - 20 content pieces per month
  - All content types
  - Meta description generation

### Business Plan
- Price: $19.99/month
- Features:
  - 50 content pieces per month
  - All content types
  - Meta description generation
  - Priority support

## Adding Price IDs to Frontend Environment Variables

Add the Stripe price IDs to your frontend environment variables:

```
VITE_STRIPE_PRO_PRICE_ID=your_pro_price_id
VITE_STRIPE_BUSINESS_PRICE_ID=your_business_price_id
```

## Testing the Integration

1. Create a test user account
2. Subscribe to a plan using the checkout flow
3. Verify that the subscription status is updated in the database
4. Check that the content limits are applied correctly based on the subscription tier 