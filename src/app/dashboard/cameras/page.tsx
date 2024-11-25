'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Snackbar, Alert} from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { jsPDF } from 'jspdf';

import { API_URL } from '@/config';
import { CamerasFilters } from '@/components/dashboard/cameras/cameras-filters';
import { CamerasTable } from '@/components/dashboard/cameras/cameras-table';
import type { CamerasParams } from '@/lib/auth/client';
import 'jspdf-autotable';
import { Controller, useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { useUser } from '@/hooks/use-user';
import type { User} from '@/types/user'

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [cameras, setCameras] = useState<CamerasParams[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CamerasParams | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error'): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };  

  const filteredCameras = cameras.filter((filtredCameras) => {
    const fullName = `${filtredCameras.name} ${filtredCameras.description || ''}}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase())
    );
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchCameras = useCallback(async (): Promise<void> => {
    let retryCount = 0;
    const maxRetries = 3; // Limitar los reintentos
  
    while (retryCount < maxRetries) {
      try {
        const storedUser: User = JSON.parse(localStorage.getItem('user') || '{}');
        const supermarketId = storedUser.ownedSupermarket?.id || storedUser.supermarket?.id;
        const token = localStorage.getItem('custom-auth-token');

        const response = await fetch(`${API_URL}/cameras/supermarket/${supermarketId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const clearStorageAndReload = (): void => {
          localStorage.clear();
          window.location.reload();  // Recarga la página después de limpiar el almacenamiento
        };
  
        // Puedes usar esto en el caso de un error 401
        if (response.status === 401) {
          clearStorageAndReload();
        }
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data: CamerasParams[] = await response.json();
        data.sort((a, b) => b.id - a.id);
        setCameras(data);
        break; // Si todo va bien, rompe el ciclo y no reintenta
      } catch (error) {
        retryCount += 1;  
        if (retryCount >= maxRetries) {
          setCameras([]);
          showErrorMessage('Error al cargar las cámaras después de varios intentos');
          break; // Para evitar un loop infinito si no puede completar los llamados
        }
      } finally {
        setLoading(false);
      }
    }
  }, []);  
  
  useEffect(() => {
    fetchCameras(); // Cargar datos de cámaras
  }, [fetchCameras]); // El efecto solo se ejecutará si `fetchCameras` cambia
  

  const handleOpenModal = (selectedUser?: CamerasParams): void => {
    setEditingCamera(selectedUser || null);

    if (selectedUser) {
      (Object.keys(selectedUser) as (keyof CamerasParams)[]).forEach((key) => {
        if (['name', 'description'].includes(key as string)) {
          const value = selectedUser[key];
    
          setValue(
            key as 'name' | 'description',
            value ? String(value) : ''
          );
        }
      });
    } else {
      reset();
    }

    setModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setModalOpen(false);
    setEditingCamera(null);
    reset();
  };

  const handleFormSubmit = async (data: any): Promise<void> => {
    const submitUser  = localStorage.getItem('user');
  
    if (!submitUser ) {
      return;
    }
  
    const userObject: User = JSON.parse(submitUser );
    const supermarketId = userObject.ownedSupermarket?.id; // Obtén el supermarketId como antes
  
    const updatedFormData: Partial<User> = {
      ...data,
    };
  
    // Si estás editando una cámara, no incluyas supermarketId
    if (editingCamera) {
      if ('password' in updatedFormData) {
        delete updatedFormData.password;
      }
      // No incluyas supermarketId en la solicitud de edición
    } else {
      // Si no estás editando, añade supermarketId
      updatedFormData.supermarketId = supermarketId;
    }
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const method = editingCamera ? 'PATCH' : 'POST';
      const url = editingCamera ? `${API_URL}/cameras/${editingCamera.id}` : `${API_URL}/cameras`;
  
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFormData), // Envía solo updatedFormData
      });
  
      if (!response.ok) {
        showSnackbar('Error al crear cámara, ya has alcanzado el máximo de cámaras registradas', 'error');
        return;
      }
  
      const savedCamera: CamerasParams = await response.json();
  
      if (!editingCamera) {
        setCameras((prevCameras) => [savedCamera, ...prevCameras]);
      } else {
        setCameras((prevCameras) => 
          prevCameras.map((camera) => (camera.id === savedCamera.id ? savedCamera : camera))
        );
      }
  
      showSnackbar(editingCamera ? 'Cámara actualizada con éxito' : 'Cámara creada con éxito', 'success');
      fetchCameras(); // Actualiza la lista de cámaras
      handleCloseModal(); // Cierra el modal después de completar la acción
      reset(); // Limpia el formulario
    } catch (error) {
      showSnackbar('Error al crear o actualizar la cámara', 'error');
    }
  };

  const handleDeleteUser = async (userId: number): Promise<void> => {
    setCameraToDelete(userId);
    setDialogOpen(true);
  };

  const handleExportExcel = (): void => {
    if (cameras.length === 0) {
      showErrorMessage('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      cameras.map((camerasXLSXL) => ({
        'Nombre de Cámara': camerasXLSXL.name || '',
        'Descripción': camerasXLSXL.description || '',
      }))
    );

    const headerCell = worksheet['!rows'] || [];
    headerCell[0] = { hpt: 18, hpx: 18 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cámaras');

    XLSX.writeFile(workbook, 'camaras.xlsx');
    handleCloseMenu();
    showSuccessMessage('Exportado a Excel con éxito');
  };
  const handleExportPDF = (): void => {
    // eslint-disable-next-line new-cap -- Utilizamos `new jsPDF()` como una excepción ya que el nombre viene de una biblioteca externa que no sigue esta convención.
    const doc = new jsPDF();
    doc.text('Lista de Cámaras', 10, 10);

    const columns = ['Nombre de Cámara', 'Descripción'];
    const rows = cameras.map((camerasPdf) => [
      camerasPdf.name,
      camerasPdf.description,
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
    });

    doc.save('camaras.pdf');
    handleCloseMenu();
    showSuccessMessage('Exportado a PDF con éxito');
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (): void => {
    setAnchorEl(null);
  };

  const showSuccessMessage = (message: string): void => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const showErrorMessage = (message: string): void => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 3000);
  };

  const paginatedCameras = applyPagination(filteredCameras, cameras, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Cámaras</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              color="inherit"
              startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleClickMenu}
            >
              Exportar
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
              <MenuItem onClick={handleExportPDF}>Exportar a PDF</MenuItem>
              <MenuItem onClick={handleExportExcel}>Exportar a Excel</MenuItem>
            </Menu>
          </Stack>
        </Stack>
        {currentUser?.role !== 'viewer' && (
          <div>
            <Button
              startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
              variant="contained"
              onClick={() => {
                handleOpenModal();
              }}
            >
              Añadir
            </Button>
          </div>
        )}
      </Stack>
      <CamerasFilters onSearch={setSearchTerm} />
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <CamerasTable
          count={cameras.length}
          page={page}
          rows={paginatedCameras}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onEdit={handleOpenModal}
          onDelete={handleDeleteUser}
        />
      )}

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Stack
          spacing={2}
          sx={{
            padding: 4,
            backgroundColor: 'white',
            width: '90%',
            maxWidth: '400px',
            margin: 'auto',
            marginTop: '50px',
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6">{editingCamera ? 'Editar Cámara' : 'Agregar Cámara'}</Typography>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field }) => (
                <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name ? errors.name.message : ''}
                inputProps={{
                    maxLength: 50,
                    onInput: (event) => {
                    const input = event.target as HTMLInputElement;
                    input.value = input.value.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
                    },
                    onKeyPress: (event) => {
                    if (!/^[A-Za-zÀ-ÿ0-9\s]$/.test(event.key)) {
                        event.preventDefault();
                    }
                    },
                }}
                sx={{ marginTop: '5px' }}
                required
                />
            )}
            />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Descripción"
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 200,
              onInput: (event) => {
                const input = event.target as HTMLInputElement;
                input.value = input.value.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
              }
             }}
             />
          )}
        />
          <Button variant="contained" onClick={handleSubmit(handleFormSubmit)} disabled={!isValid || isPending}>
            {editingCamera ? 'Actualizar' : 'Agregar'}
          </Button>
        </Stack>
      </Modal>
      {successMessage ? <Typography sx={{ color: 'green' }}>{successMessage}</Typography> : null}
      {errorMessage ? <Typography sx={{ color: 'red' }}>{errorMessage}</Typography> : null}
      <Dialog
        open={Boolean (dialogOpen)}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta cámara?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogOpen(false);
            }}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              if (cameraToDelete !== null) {
                try {
                  const token = localStorage.getItem('custom-auth-token');
                  const response = await fetch(`${API_URL}/cameras/${cameraToDelete}`, {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
            
                  if (!response.ok) {
                    showSnackbar('Error al eliminar la cámara', 'error');
                    return;
                  }
            
                  fetchCameras();  // Actualiza la lista de usuarios
                  showSnackbar('Cámara eliminada con éxito', 'success');
                } catch (error) {
                  showSnackbar('Error al eliminar la cámara', 'error');
                } finally {
                  setDialogOpen(false);  // Cierra el diálogo
                  setCameraToDelete(null);  // Limpia el estado
                }
              }
            }}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
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

function applyPagination(rows: CamerasParams[], _cameras: CamerasParams[], page: number, rowsPerPage: number): CamerasParams[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
