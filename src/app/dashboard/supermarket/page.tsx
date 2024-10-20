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
}