/*
  # Add subscription and billing tables

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `plan_id` (text)
      - `status` (text)
      - `current_period_end` (timestamptz)
      - `cancel_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `usage_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content_count` (integer)
      - `period_start` (timestamptz)
      - `period_end` (timestamptz)

  2. Updates
    - Add subscription-related columns to profiles table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add subscription fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active';

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  content_count integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  USING (true)
  WITH CHECK (true);

-- Policies for usage limits
CREATE POLICY "Users can view own usage"
  ON usage_limits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
  ON usage_limits
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_period ON usage_limits(period_start, period_end);