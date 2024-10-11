import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { SupermarketGuard } from '@/components/auth/supermarket-guard';
import { Layout } from '@/components/auth/layout';
import { SupermarketSignUpForm } from '@/components/auth/supermarket-sign-up-form';

export const metadata: Metadata = { title: config.site.name };

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <SupermarketGuard>
        <SupermarketSignUpForm />
      </SupermarketGuard>
    </Layout>
  );
}
