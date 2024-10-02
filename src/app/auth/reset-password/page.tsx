import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: config.site.name }; 

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <ResetPasswordForm />
      </GuestGuard>
    </Layout>
  );
}
