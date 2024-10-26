'use client';

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Menu, MenuItem, Select,} from '@mui/material';
import Button from '@mui/material/Button';
// import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { jsPDF } from 'jspdf';

import { API_URL } from '@/config';
import { CustomersFilters } from '@/components/dashboard/customer/customers-filters';
import { CustomersTable } from '@/components/dashboard/customer/customers-table';
import type { Customer } from '@/components/dashboard/customer/customers-table';

import 'jspdf-autotable';

import { Controller, useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';

import { useUser } from '@/hooks/use-user';

export default function Page(): React.JSX.Element {
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      secondLastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: '',
    },
  });

  const filteredCustomers = user.filter((customer) => {
    const fullName = `${customer.firstName} ${customer.middleName || ''} ${customer.lastName} ${customer.secondLastName || ''}`.toLowerCase();
    const email = customer.email.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
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

  const fetchUser = useCallback(async (): Promise<void> => {
    interface User {
      ownedSupermarket?: {
        id: string;
      };
      supermarket?: {
        id: string;
      };
    }
    try {
      const storedUser: User = JSON.parse(localStorage.getItem('user') || '{}');
      const supermarketId = storedUser.ownedSupermarket?.id || storedUser.supermarket?.id;
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`${API_URL}/users/supermarket/${supermarketId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: Customer[] = await response.json();
      data.sort((a, b) => b.id - a.id);
      setUser(data);
    } catch (error) {
      setUser([]);
      showErrorMessage('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleOpenModal = (selectedUser?: Customer): void => {
    setEditingUser(selectedUser || null);

    if (selectedUser) {
      (Object.keys(selectedUser) as (keyof Customer)[]).forEach((key) => {
        if (
          [
            'firstName',
            'middleName',
            'lastName',
            'secondLastName',
            'email',
            'phoneNumber',
            'password',
            'role',
          ].includes(key)
        ) {
          const value = selectedUser[key];

          setValue(
            key as
              | 'firstName'
              | 'middleName'
              | 'lastName'
              | 'secondLastName'
              | 'email'
              | 'phoneNumber'
              | 'password'
              | 'role',
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
    setEditingUser(null);
    reset();
  };

  const handleFormSubmit = async (data: any): Promise<void> => {
    const submitUser = localStorage.getItem('user');

    interface User {
      id: string;
      ownedSupermarket?: { id: string };
      password?: string;
      supermarketId?: number;
    }

    if (!submitUser) {
      return;
    }

    const userObject: User = JSON.parse(submitUser);

    const updatedFormData: Partial<User> = {
      ...data,
      supermarketId: userObject.ownedSupermarket?.id,
    };

    if (editingUser) {
      if ('password' in updatedFormData) {
        delete updatedFormData.password;
      }
      if ('supermarketId' in updatedFormData) {
        delete updatedFormData.supermarketId;
      }
    }

    try {
      const token = localStorage.getItem('custom-auth-token');
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `${API_URL}/users/${editingUser.id}` : `${API_URL}/users`;
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedFormData }),
      });

      if (!response.ok) {
        return;
      }

      const savedUser: Customer = await response.json();
      if (!editingUser) {
        setUser((prevUsers) => [savedUser, ...prevUsers]);
      } else {
        setUser((prevUsers) => prevUsers.map((editUser) => (editUser.id === savedUser.id ? savedUser : editUser)));
      }

      fetchUser();
      showSuccessMessage(editingUser ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
      handleCloseModal();
      reset();
    } catch (error) {
      showErrorMessage('Error al guardar el usuario');
    }
  };

  const handleDeleteUser = async (userId: number): Promise<void> => {
    setUserToDelete(userId);
    setDialogOpen(true);
  };

  const handleExportExcel = (): void => {
    if (user.length === 0) {
      showErrorMessage('No hay datos para exportar');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      user.map((userXLSXL) => ({
        'Primer Nombre': userXLSXL.firstName || '',
        'Segundo Nombre': userXLSXL.middleName || '',
        'Primer Apellido': userXLSXL.lastName || '',
        'Segundo Apellido': userXLSXL.secondLastName || '',
        'Correo Electrónico': userXLSXL.email || '',
        'Número de Celular': userXLSXL.phoneNumber || '',
        Rol: userXLSXL.role || '',
      }))
    );

    const headerCell = worksheet['!rows'] || [];
    headerCell[0] = { hpt: 18, hpx: 18 };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

    XLSX.writeFile(workbook, 'usuarios.xlsx');
    handleCloseMenu();
    showSuccessMessage('Exportado a Excel con éxito');
  };
  const handleExportPDF = (): void => {
    // eslint-disable-next-line new-cap -- Utilizamos `new jsPDF()` como una excepción ya que el nombre viene de una biblioteca externa que no sigue esta convención.
    const doc = new jsPDF();
    doc.text('Lista de Usuarios', 10, 10);

    const columns = ['Primer Nombre', 'Apellido', 'Correo Electrónico', 'Número de Celular', 'Rol'];
    const rows = user.map((userPdf) => [
      userPdf.firstName,
      userPdf.lastName,
      userPdf.email,
      userPdf.phoneNumber,
      userPdf.role,
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
    });

    doc.save('usuarios.pdf');
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

  const paginatedCustomers = applyPagination(filteredCustomers, user, page, rowsPerPage);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Usuarios</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {/* <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Importar
            </Button> */}
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
      <CustomersFilters onSearch={setSearchTerm} />
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <CustomersTable
          count={user.length}
          page={page}
          rows={paginatedCustomers}
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
          <Typography variant="h6">{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</Typography>
          <Controller
            name="firstName"
            control={control}
            rules={{ required: 'El primer nombre es obligatorio' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Primer Nombre"
                fullWidth
                error={Boolean(errors.firstName)}
                helperText={errors.firstName ? errors.firstName.message : ''}
                inputProps={{ maxLength: 50 }}
                required
              />
            )}
          />

          <Controller
            name="middleName"
            control={control}
            rules={{ required: 'El segundo nombre es obligatorio' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Segundo Nombre"
                fullWidth
                error={Boolean(errors.middleName)}
                helperText={errors.middleName?.message}
                inputProps={{ maxLength: 50 }}
                required
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            rules={{ required: 'El primer apellido es obligatorio' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Primer Apellido"
                fullWidth
                error={Boolean(errors.lastName)}
                helperText={errors.lastName?.message}
                inputProps={{ maxLength: 50 }}
                required
              />
            )}
          />

          <Controller
            name="secondLastName"
            control={control}
            rules={{ required: 'El segundo apellido es obligatorio' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Segundo Apellido"
                fullWidth
                error={Boolean(errors.secondLastName)}
                helperText={errors.secondLastName?.message}
                inputProps={{ maxLength: 50 }}
                required
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: 'El correo electrónico es obligatorio',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'El formato del correo es inválido',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Correo Electrónico"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                inputProps={{ maxLength: 255 }}
                required
              />
            )}
          />

          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: 'El número de celular es obligatorio',
              pattern: {
                value: /^[0-9]{10}$/,
                message: 'El número de celular debe tener 10 dígitos',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Número de Celular"
                fullWidth
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber?.message}
                inputProps={{ maxLength: 10 }}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                required
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={
              editingUser
                ? undefined
                : {
                    // Solo aplica las reglas si no está editando
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 9, // Cambia a 9 como especificaste antes
                      message: 'La contraseña debe tener al menos 9 caracteres',
                    },
                    maxLength: {
                      value: 20,
                      message: 'La contraseña no debe tener más de 20 caracteres',
                    },
                    validate: {
                      uppercase: (value) =>
                        /[A-Z]/.test(value) || 'La contraseña debe contener al menos una letra mayúscula',
                      lowercase: (value) =>
                        /[a-z]/.test(value) || 'La contraseña debe contener al menos una letra minúscula',
                      number: (value) => /[0-9]/.test(value) || 'La contraseña debe contener al menos un número',
                      specialChar: (value) =>
                        /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                        'La contraseña debe contener al menos un carácter especial',
                    },
                  }
            }
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Contraseña"
                type="password"
                fullWidth
                error={Boolean(error)}
                helperText={error?.message}
                inputProps={{
                  maxLength: 20,
                  readOnly: editingUser, // Campo de solo lectura si está editando
                }}
                required={!editingUser} // El campo es requerido solo si no está editando
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            rules={{ required: 'Debes seleccionar un rol' }}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select {...field} label="Rol" error={Boolean(errors.role)}>
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="viewer">Observador</MenuItem>
                  <MenuItem value="cashier">Cajero</MenuItem>
                </Select>
                {errors.role && <Typography color="error">{errors.role?.message}</Typography>}
              </FormControl>
            )}
          />
          <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>
            {editingUser ? 'Actualizar' : 'Agregar'}
          </Button>
        </Stack>
      </Modal>
      {successMessage && <Typography sx={{ color: 'green' }}>{successMessage}</Typography>}
      {errorMessage && <Typography sx={{ color: 'red' }}>{errorMessage}</Typography>}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este usuario?</Typography>
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
              if (userToDelete !== null) {
                try {
                  const token = localStorage.getItem('custom-auth-token');
                  await fetch(`${API_URL}/users/${userToDelete}`, {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  fetchUser();
                  showSuccessMessage('Usuario eliminado con éxito');
                } catch (error) {
                  showErrorMessage('Error al eliminar el usuario');
                } finally {
                  setDialogOpen(false); // Cierra el diálogo
                  setUserToDelete(null); // Limpia el estado
                }
              }
            }}
            color="error"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function applyPagination(rows: Customer[], _user: Customer[], page: number, rowsPerPage: number): Customer[] {
  return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}
