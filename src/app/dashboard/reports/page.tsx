'use client'

import React, { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, Button, Grid, Typography, CircularProgress, Box, Paper, Snackbar } from '@mui/material';
import { API_URL } from '@/config';
import type { User } from '@/types/user';

interface ReportOption {
  label: string;
  value: string;
}

const reportOptions: ReportOption[] = [
  { label: 'Productos más vendidos', value: 'most-sold' },
  { label: 'Ganancias Totales', value: 'profits' },
  { label: 'Frescura de Carnes', value: 'meat-refreshnes' },
  { label: 'Productos por Usuario', value: 'products-by-user' },
  { label: 'Productos Menos Vendidos', value: 'least-sold' },
  { label: 'Productos por Categoría', value: 'products-by-category' },
  { label: 'Rotación de Inventario', value: 'inventory-rotation' },
  { label: 'Reporte de predicciones de la calidad de la carne', value: 'status-summary' },
  { label: 'Analisis completo de la calidad de la carne', value: 'analysis' },
  { label: 'Tendencia de la calidad de la carne a lo largo del tiempo', value: 'trend' },
  { label: 'Productos con nivel de stock critico', value: 'critical-stock' },
];

export default function ReportPage(): React.JSX.Element {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [supermarketId, setSupermarketId] = useState<string>('');
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const showSnackbar = (message: string): void => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (): void => {
    setOpenSnackbar(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        const id = user?.supermarket?.id?.toString() || user?.ownedSupermarket?.id?.toString();
        if (id) {
          setSupermarketId(id);
        } else {
            showSnackbar("No se encontró el ID del supermercado en los datos del usuario.");
          }
        } catch (error) {
          showSnackbar("Error al parsear el usuario almacenado.");
        }
      } else {
        showSnackbar("No se encontró el usuario en el almacenamiento local.");
      }
  }, []);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, checked } = event.target;
    setSelectedReports(prevState =>
      checked ? [...prevState, value] : prevState.filter(report => report !== value)
    );
  };

  const fetchReports = async (): Promise<void> => {
    if (!supermarketId) {
      showSnackbar("No se encontró el ID del supermercado.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('custom-auth-token');
      const data: Record<string, any> = {};

      for (const report of selectedReports) {
        const url = `${API_URL}/reports/${report}?supermarketId=${supermarketId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching report data for ${report}`);
        }

        const reportResult = await response.json();
        data[report] = reportResult;
      }

      setReportData(data);
    } catch (error) {
        showSnackbar('Error fetching reports:');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12}>
        <Typography variant="h4">Generar Reportes</Typography>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Typography variant="h6" sx={{ marginBottom: 2, textAlign: 'center' }}>Selecciona los reportes:</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {reportOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    value={option.value}
                    onChange={handleCheckboxChange}
                    checked={selectedReports.includes(option.value)}
                  />
                }
                label={option.label}
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={fetchReports}
          disabled={selectedReports.length === 0 || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generar Reportes'}
        </Button>
      </Grid>

      <Grid item xs={12}>
        {loading ? (
          <CircularProgress />
        ) : (
          Object.keys(reportData).map((reportKey) => (
            <div key={reportKey}>
              <Typography variant="h6">
                {reportOptions.find(option => option.value === reportKey)?.label}
              </Typography>
              <pre>{JSON.stringify(reportData[reportKey], null, 2)}</pre>
            </div>
          ))
        )}
      </Grid>

      <Snackbar
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        autoHideDuration={3000}
      />
    </Grid>
  );
}

