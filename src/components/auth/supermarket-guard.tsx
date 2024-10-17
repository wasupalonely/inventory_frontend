'use client';
import { useUser } from '@/hooks/use-user';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import { paths } from '@/paths';

export interface SupermarketGuardProps {
  children: React.ReactNode;
}
export function SupermarketGuard({ children }: SupermarketGuardProps): React.JSX.Element | null {
    const router = useRouter();
    const { user, error, isLoading } = useUser();
    const [isChecking, setIsChecking] = React.useState<boolean>(true);
  
    const checkSupermarket = React.useCallback(async (): Promise<void> => {
      if (isLoading) {
        return; // Esperar a que se cargue la información del usuario
      }
  
      if (error) {
        setIsChecking(false);
        return; // Manejar error de carga de usuario
      }
  
      const ownerId = localStorage.getItem('ownerId');
  
      // Si el usuario no está autenticado, redirigir a inicio de sesión
      if (!user) {
        router.replace(paths.auth.signIn);
        return;
      }
  
      // Si no hay ownerId, permitir que accedan al formulario de registro de supermercado
      if (!ownerId) {
        setIsChecking(false); // Permitir que el contenido se renderice (el formulario)
        router.replace(paths.auth.superMarketSignUp);
        return; // Aquí no rediriges, permites que se muestre el formulario
      }
  
      setIsChecking(false); // Usuario autenticado y tiene ownerId
    }, [user, error, isLoading, router, setIsChecking]);
    
  
    React.useEffect(() => {
      checkSupermarket().catch(() => {
        // Manejo de errores
      });
    }, [checkSupermarket]);
  
    if (isChecking) {
      return null; // Puedes mostrar un spinner aquí si lo deseas
    }
  
    if (error) {
      return <Alert color="error">{error}</Alert>; // Muestra un mensaje de error
    }
  
    return <React.Fragment>{children}</React.Fragment>; // Muestra el contenido hijo (el formulario)
  }