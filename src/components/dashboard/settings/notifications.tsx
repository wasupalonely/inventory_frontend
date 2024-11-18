'use client';

import * as React from 'react';
import {Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import type {SelectChangeEvent} from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { User } from '@/types/user';
import { API_URL } from '@/config';
import { useEffect, useState } from 'react';

export function Notifications(): React.JSX.Element {
  const [isCronEnabled, setIsCronEnabled] = React.useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<string>(() => {
    // Obtener el valor de `scheduleFrequency` desde localStorage o usar 'DAILY' como valor por defecto
    return localStorage.getItem('scheduleFrequency') || 'DAILY';
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isFirstActivation, setIsFirstActivation] = useState<boolean>(false); // Estado para controlar la primera activación del cronjob


  const showSnackbar = (message: string, severity: 'success' | 'error'): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleFrequencyChange = (event: SelectChangeEvent): void => {
    const newFrequency = event.target.value;
    setScheduleFrequency(newFrequency);
    localStorage.setItem('scheduleFrequency', newFrequency); 
  };  

  useEffect(() => {
    const fetchCronStatus = async (): Promise<void> => {
      const user: User = JSON.parse(localStorage.getItem('user') || '{}');
      const supermarketId = user?.supermarket?.id?.toString() || user?.ownedSupermarket?.id?.toString();

      try {
        const token = localStorage.getItem('custom-auth-token');
        const response = await fetch(`${API_URL}/supermarket/${supermarketId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data: { cronjobEnabled: boolean; scheduleFrequency: string } = await response.json();
          setIsCronEnabled(Boolean(data.cronjobEnabled));
          setScheduleFrequency(data.scheduleFrequency); // Actualiza la frecuencia con el valor obtenido del backend
          localStorage.setItem('scheduleFrequency', data.scheduleFrequency); // Guarda en localStorage
          if (data.cronjobEnabled) {
            setIsFirstActivation(true); // Marca como activado si el cronjob está habilitado
          }
        } else {
          showSnackbar('Error al obtener el estado del cronjob', 'error');
        }
      } catch (error) {
        showSnackbar('Error al obtener el estado del cronjob', 'error');
      }
    };

    fetchCronStatus();
  }, []);

  const enableCron = async (supermarketId: string, enableFrequency: string): Promise<void> => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`${API_URL}/supermarket/${supermarketId}/enable-cron`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleFrequency: enableFrequency }),
      });
      if (response.ok) {
        setIsCronEnabled(true);
        setIsFirstActivation(true); // Marca que el cronjob ha sido activado
        showSnackbar('Cronjob habilitado correctamente', 'success');
      } else {
        showSnackbar('Error al habilitar el cronjob', 'error');
      }
    } catch (error) {
      showSnackbar('Error al habilitar el cronjob', 'error');
    }
  };

  const disableCron = async (supermarketId: string, disableFrequency: string): Promise<void> => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`${API_URL}/supermarket/${supermarketId}/disable-cron`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduleFrequency: disableFrequency }),
      });
      if (response.ok) {
        setIsCronEnabled(false);
        setIsFirstActivation(false); // Permite nuevamente seleccionar "Cada minuto" cuando se desactiva el cronjob
        showSnackbar('Cronjob deshabilitado correctamente', 'success');
      } else {
        showSnackbar('Error al deshabilitar el cronjob', 'error');
      }
    } catch (error) {
      showSnackbar('Error al deshabilitar el cronjob', 'error');
    }
  };

  const handleSwitchChange = async (): Promise<void> => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    const supermarketId = user?.supermarket?.id?.toString() || user?.ownedSupermarket?.id?.toString();

    if (!supermarketId) {
      showSnackbar("ID del supermercado no encontrado", 'error');
      return;
    }

    if (isCronEnabled) {
      await disableCron(supermarketId, scheduleFrequency);
    } else {
      await enableCron(supermarketId, scheduleFrequency);
    }
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); }}>
      <Card>
        <CardHeader subheader="Gestionar las notificaciones" title="Notificaciones" />
        <Divider />
        <CardContent>
          <Grid container spacing={6} wrap="wrap">
            <Grid md={4} sm={6} xs={12}>
              <Stack spacing={1}>
                <Typography variant="h6">Activar predicciones</Typography>
                <FormControlLabel
                  control={<Switch checked={isCronEnabled} onChange={handleSwitchChange} />}
                  label="Predicciones automáticas"
                />
                {isCronEnabled && (
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="frequency-label">Frecuencia</InputLabel>
                    <Select
                      labelId="frequency-label"
                      id="scheduleFrequency"
                      value={scheduleFrequency}
                      label="Frecuencia"
                      onChange={handleFrequencyChange}
                      disabled={isFirstActivation && scheduleFrequency === 'EVERY_MINUTE'} // Deshabilita "Cada minuto" después de la primera activación
                    >
                      <MenuItem value="EVERY_MINUTE" disabled={isFirstActivation}>Cada minuto</MenuItem> {/* Deshabilita la opción después de la primera activación */}
                      <MenuItem value="DAILY">Diario</MenuItem>
                      <MenuItem value="TWICE_DAILY">Dos veces al día</MenuItem>
                      <MenuItem value="WEEKLY">Semanal</MenuItem>
                      <MenuItem value="TWICE_WEEKLY">Dos veces a la semana</MenuItem>
                      <MenuItem value="MONTHLY">Mensual</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </form>
  );
}