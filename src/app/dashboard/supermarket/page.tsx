'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Stack, Typography, Alert } from '@mui/material';
import { API_URL } from '@/config';

export default function SupermarketInfoPage() {
  const [supermarket, setSupermarket] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = localStorage.getItem('custom-auth-token');

  // Obtener información del supermercado
  useEffect(() => {
    const fetchSupermarketData = async () => {
      try {
        const response = await fetch(`${API_URL}/supermarket`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSupermarket(data);
      } catch (error) {
        setErrorMessage('Error al obtener la información del supermercado');
      }
    };

    fetchSupermarketData();
  }, [token]);

//   return (
//     <Stack spacing={3}>
//       <Typography variant="h4">Información del Supermercado</Typography>
//       {supermarket ? (
//         <Stack spacing={2}>
//           <Typography variant="h6">Nombre del Supermercado: {supermarket.name}</Typography>
//           <Typography variant="h6">Propietario: {supermarket.ownerName}</Typography>
//           <Typography variant="h6">Dirección: {supermarket.address.neighborhood}, {supermarket.address.locationType} {supermarket.address.streetNumber} #{supermarket.address.intersectionNumber}-{supermarket.address.buildingNumber}</Typography>
//         </Stack>
//       ) : (
//         <Typography>Cargando información del supermercado...</Typography>
//       )}

//       {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
//     </Stack>
//   );
}