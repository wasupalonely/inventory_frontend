'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Typography, CircularProgress, Alert, Stack, Snackbar, Button } from '@mui/material';
import type { CamerasParams } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { authClient } from '@/lib/auth/client';
import { API_URL } from '@/config';
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation';

export default function CameraDetails(): React.JSX.Element {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cameraId = searchParams.get('id');
  const [cameras, setCameras] = useState<CamerasParams[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CamerasParams | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [errors, setErrors] = useState<string | null>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error'): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchCameras = async (): Promise<void> => {
      try {
        const response = await fetch(`${API_URL}/cameras`);
        if (!response.ok) {
          throw new Error('Error al obtener las predicciones');
        }

        const data: CamerasParams[] = await response.json();
        setCameras(data);
      } catch (error) {
        if (error instanceof Error) {
          setErrors(error.message);
          showSnackbar('Error al cargar las predicciones', 'error');
        } else {
          setErrors('Error desconocido');
          showSnackbar('Error desconocido', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCameras();
  }, [user]);

  const fetchCameraDetails = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await authClient.getCameraById(Number(id));
      if (error) {
        throw new Error(error);
      }
      setSelectedCamera(data || null);
    } catch (errorPredic) {
      if (errorPredic instanceof Error) {
        setErrors(errorPredic.message);
        showSnackbar('Error al cargar la predicción', 'error')
      } else {
        setErrors('Error desconocido');
        showSnackbar('Error desconocido', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !cameraId) return;
  
    fetchCameraDetails(cameraId);
  }, [router.isReady, cameraId, fetchCameraDetails]);

  if (loading) {
    return <CircularProgress />;
  }

  if (errors) {
    return <Alert severity="error">{errors}</Alert>;
  }

  if (!selectedCamera) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4">Lista de Predicciones</Typography>
        {cameras.length > 0 ? (
          cameras.map((camera) => (
            <Button
              key={camera.id}
              onClick={() => {
                if (camera.id !== undefined) {
                  fetchCameraDetails(camera.id.toString());
                }
              }}
            >
              Ver Predicción {camera.id}
            </Button>
          ))
        ) : (
          <Typography>No se encontraron predicciones.</Typography>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4">Detalles de la Cámara</Typography>
      <Typography>Nombre: {selectedCamera.name}</Typography>
      <Typography>Descripción: {selectedCamera.description}</Typography>
      <Typography>ID: {selectedCamera.id}</Typography>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}