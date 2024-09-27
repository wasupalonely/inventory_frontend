import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { SupermarketSignUpForm } from '@/components/auth/supermarket-sign-up-form';

export const metadata = { title: `Supermarket sign up | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <SupermarketSignUpForm/>
      </GuestGuard>
    </Layout>
  );
}