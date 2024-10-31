'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress'; // Importar el spinner

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  
  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    

    if (!user) {
      logger.debug('[AuthGuard]: User is not logged in, redirecting to sign in');
      router.replace(paths.auth.signIn);
      return;
    }
    
    logger.debug('[AuthGuard]: Checking user.ownedSupermarket', user.ownedSupermarket);
    
    
    if (user.role === 'owner' && user.ownedSupermarket === null) {
      logger.debug('[AuthGuard]: No supermarket found, rendering the supermarket sign-up form');
      router.replace(paths.auth.superMarketSignUp);
      setIsChecking(false);
      return; 
    }   
    setIsChecking(false);
  };

  React.useEffect(() => {
    
    checkPermissions().catch(() => {
      // noop
    });
  }, [user, error, isLoading]);

  const centeredContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Asegura que el spinner esté centrado en toda la pantalla
  };

  if (isChecking || isLoading) {
    return (
      <div style={centeredContainerStyle}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Alert color="error">{error}</Alert>; // Mostrar un error si lo hay
  }

  // Aquí se renderiza el formulario porque no hay redirección
  return <>{children}</>;
}
