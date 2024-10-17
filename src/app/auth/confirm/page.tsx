'use client';

import * as React from 'react';
import type { JSX } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';

import { authClient } from '@/lib/auth/client';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';

function ConfirmContent(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [globalError, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState<boolean>(true);
  const [isConfirmed, setIsConfirmed] = React.useState<boolean>(false); // Para manejar la confirmación exitosa

  React.useEffect(() => {
    const confirmAccount = async (): Promise<void> => {
      const tokenStr = Array.isArray(token) ? token[0] : token;

      if (!tokenStr) {
        setError('El token de confirmación no es válido.');
        setIsPending(false);
        return;
      }

      // Verificar si el usuario tiene permiso para acceder
      const canAccess = localStorage.getItem('canAccessConfirmation');
      if (!canAccess) {
        setError('No tienes permiso para acceder a esta página porque este token ya sido utilizado.');
        setIsPending(false);
        setTimeout(() => {
          router.replace('/auth/sign-in');
        }, 5000);
        return;
      }

      try {
        const { error } = await authClient.confirmAccount({ token: tokenStr });

        if (error) {
          // Manejo específico del error si el token ya fue usado
          if (error === 'Token ya ha sido usado.') {
            setError('Este token ya ha sido usado. Si ya confirmaste tu cuenta, intenta iniciar sesión.');
          } else {
            setError(error);
          }
        } else {
          // Confirmación exitosa
          setIsConfirmed(true);
          // Limpiar el indicador después de confirmar la cuenta
          localStorage.removeItem('canAccessConfirmation');
          // Redirigir al login después de confirmar exitosamente
          setTimeout(() => {
            router.push('/auth/sign-in');
          }, 5000);
        }
      } catch (err) {
        setError('Error en la confirmación de cuenta. Inténtalo de nuevo.');
      } finally {
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
        <>
          <Alert severity="error">{globalError}</Alert>
          <Typography>Redirigiendo al login...</Typography>
        </>
      ) : isConfirmed ? (
        <Typography>Confirmación exitosa.</Typography>
      ) : (
        <Typography>Redirigiendo al login...</Typography>
      )}
    </Stack>
  );
};

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <React.Suspense fallback={<CircularProgress />}>
          <ConfirmContent />
        </React.Suspense>
      </GuestGuard>
    </Layout>
  );
}