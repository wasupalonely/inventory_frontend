'use client'

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

import { authClient } from '@/lib/auth/client';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';


export default function Page(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState<boolean>(true);

  React.useEffect(() => {
    const confirmAccount = async (): Promise<void> => {
      const tokenStr = Array.isArray(token) ? token[0] : token;

      if (!tokenStr) return;

      try {
        const { error } = await authClient.confirmAccount({ token: tokenStr });

        if (error) {
          setError(error);
          setIsPending(false);
          return;
        }

        router.push('/auth/sign-in');
      } catch (err) {
        setError('Error confirming account. Please try again.');
        setIsPending(false);
      }
    };

    confirmAccount();
  }, [token, router]);

  return (
    <Layout>
      <GuestGuard>
        <Stack spacing={4}>
          <Typography variant="h5">Confirmando cuenta...</Typography>

          {isPending ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Typography>Redirigiendo al login...</Typography>
          )}
        </Stack>
      </GuestGuard>
    </Layout>
  );
}
