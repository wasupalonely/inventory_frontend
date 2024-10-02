'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

import { authClient } from '@/lib/auth/client';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Layout } from '@/components/auth/layout';

const ConfirmContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [globalError, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState<boolean>(true);

  React.useEffect(() => {
// Verificar si el usuario tiene permiso para acceder
  const canAccess = localStorage.getItem('canAccessConfirmation');
  if (!canAccess) {
    router.replace('/auth/sign-in');
    return;
}

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

// Limpiar el indicador después de confirmar la cuenta
  localStorage.removeItem('canAccessConfirmation');
  router.push('/auth/sign-in');
      } catch (err) {
        setError('Error confirmacion de cuenta. Intentalo de nuevo.');
        setIsPending(false);
      }
    };

    confirmAccount();
  }, [token, router]);

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Confirmando cuenta...</Typography>

      {isPending ? (
        <CircularProgress />
      ) : globalError ? (
        <Alert severity="error">{globalError}</Alert>
      ) : (
        <Typography>Redirigiendo al login...</Typography>
      )}
    </Stack>
  );
};

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <AuthGuard>
        <React.Suspense fallback={<CircularProgress />}>
          <ConfirmContent />
        </React.Suspense>
      </AuthGuard>
    </Layout>
  );
}