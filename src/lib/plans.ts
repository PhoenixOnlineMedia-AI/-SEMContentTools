export const plans = {
  'free': {
    name: 'Free',
    limit: 5,
    price: 0
  },
  'pro': {
    name: 'Pro',
    limit: 20,
    price: 29
  },
  'business': {
    name: 'Business',
    limit: 50,
    price: 79
  }
} as const;

export type PlanId = keyof typeof plans;