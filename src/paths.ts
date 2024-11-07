export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    confirm: '/auth/confirm',
    updatePassword: '/auth/update-password',
    forgotPassword: '/auth/forgot-password',
    superMarketSignUp: '/auth/supermarket-sign-up',
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    inventory: '/dashboard/inventory',
    sales: '/dashboard/sales',
    sales_history: '/dashboard/sales-history',
    settings: '/dashboard/settings',
    supermarket: 'dashboard/supermarket/',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
