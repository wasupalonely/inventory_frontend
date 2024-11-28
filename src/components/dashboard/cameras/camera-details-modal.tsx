import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography } from '@mui/material';
import type { CamerasParams } from '@/lib/auth/client';
import { authClient } from '@/lib/auth/client';

interface CameraDetailsModalProps {
  open: boolean;
  cameraId: number;
  onClose: () => void;
}

function CameraDetailsModal({ open, cameraId, onClose }: CameraDetailsModalProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [cameraDetails, setCameraDetails] = useState<CamerasParams | null>(null);
  const [errorCamDet, setErrorCamDet] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameraDetails = async (): Promise<void> => {
      setLoading(true);
      setErrorCamDet(null);

      const { data, error } = await authClient.getCameraById(cameraId);

      if (error) {
        setErrorCamDet(error);
      } else {
        setCameraDetails(data || null);
      }

      setLoading(false);
    };

    if (cameraId) {
      fetchCameraDetails();
    }
  }, [cameraId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Detalles de la Cámara</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : errorCamDet ? (
          <Typography color="error">{errorCamDet}</Typography>
        ) : cameraDetails ? (
          <div style={{ textAlign: 'center' }}>
            <Typography variant="h6">Corte: {cameraDetails.category.name}</Typography>
            <Typography>Nombre: {cameraDetails.name}</Typography>
            <Typography>Descripción: {cameraDetails.description}</Typography>
          </div>
        ) : (
          <Typography>No se encontraron detalles para esta cámara.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CameraDetailsModal;
