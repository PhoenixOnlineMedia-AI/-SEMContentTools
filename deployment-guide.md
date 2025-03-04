# Deployment Guide for app.semcontent.tools

This guide outlines the steps to deploy the SEM Content Tools application to app.semcontent.tools using Cloudflare.

## Prerequisites

- GitHub repository with the latest code
- Cloudflare account with DNS for semcontent.tools
- Stripe account with configured products and pricing plans
- Supabase project with deployed functions

## Step 1: Build the Application

1. Clone the repository and checkout the deployment branch:
   ```bash
   git clone https://github.com/PhoenixOnlineMedia-AI/-SEMContentTools.git
   cd -SEMContentTools
   git checkout Deployed-v0.1-clean
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your environment variables (use `.env.example` as a template):
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your actual values:
   ```
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_DEEPSEEK_API_KEY=your_actual_deepseek_api_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_actual_stripe_publishable_key
   VITE_STRIPE_PRO_PRICE_ID=your_actual_pro_price_id
   VITE_STRIPE_BUSINESS_PRICE_ID=your_actual_business_price_id
   ```

5. Build the application:
   ```bash
   npm run build
   ```

## Step 2: Deploy to Cloudflare Pages

1. Install Cloudflare Wrangler CLI if you haven't already:
   ```bash
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a `wrangler.toml` file in the project root:
   ```toml
   name = "sem-content-tools"
   type = "webpack"
   account_id = "your_cloudflare_account_id"
   workers_dev = true
   route = "app.semcontent.tools/*"
   zone_id = "your_cloudflare_zone_id"

   [site]
   bucket = "./dist"
   entry-point = "workers-site"
   ```

4. Deploy to Cloudflare Pages:
   ```bash
   wrangler publish
   ```

## Step 3: Configure Cloudflare DNS

1. Log in to your Cloudflare dashboard
2. Select the semcontent.tools domain
3. Go to the DNS tab
4. Add an A record:
   - Type: A
   - Name: app
   - Content: 192.0.2.1 (this will be overridden by Cloudflare)
   - Proxy status: Proxied
   - TTL: Auto

5. Add a CNAME record:
   - Type: CNAME
   - Name: app
   - Content: your-cloudflare-pages-url.pages.dev
   - Proxy status: Proxied
   - TTL: Auto

## Step 4: Configure Stripe Webhook

1. Log in to your Stripe dashboard
2. Go to Developers > Webhooks
3. Add a new endpoint:
   - Endpoint URL: https://nrzauumxzzbeeypnoxwg.functions.supabase.co/stripe-webhook
   - Events to send: 
     - checkout.session.completed
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_succeeded
     - invoice.payment_failed

4. Copy the webhook signing secret
5. Set the webhook secret in Supabase:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
   ```

## Step 5: Verify Deployment

1. Visit https://app.semcontent.tools to ensure the application is running
2. Test user registration and login
3. Test the subscription flow:
   - Create a test user
   - Subscribe to a plan
   - Verify the subscription status in the database
   - Check that content limits are applied correctly

## Troubleshooting

### Supabase Functions

If you need to redeploy the Supabase functions:

```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-session
```

### Cloudflare Pages

If you encounter issues with Cloudflare Pages:

1. Check the build logs in the Cloudflare dashboard
2. Ensure all environment variables are correctly set
3. Verify that the site is being served from the correct directory

### Stripe Integration

If Stripe integration is not working:

1. Check the Stripe webhook logs in the Stripe dashboard
2. Verify that the webhook endpoint is correctly configured
3. Ensure the Stripe API keys are correctly set in both the frontend and backend

## Maintenance

### Updating the Application

1. Pull the latest changes from the repository
2. Build the application
3. Deploy to Cloudflare Pages

### Monitoring

1. Set up monitoring for the application using Cloudflare Analytics
2. Monitor Stripe webhook events for subscription changes
3. Check Supabase logs for any function errors 