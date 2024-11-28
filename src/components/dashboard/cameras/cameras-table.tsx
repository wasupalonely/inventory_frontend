'use client';

import * as React from 'react';
import {Snackbar, Alert, Button } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import type { CamerasParams } from '@/lib/auth/client';
import { Pencil as PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { useSelection } from '@/hooks/use-selection';
import { useUser } from '@/hooks/use-user';

interface SuccessMessageProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

interface CamerasTableProps {
  count?: number;
  page?: number;
  rows?: CamerasParams[];
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit?: (user?: CamerasParams) => void;
  onDelete?: (userId: number) => Promise<void>;
}

export function SuccessMessage({ open, message, onClose }: SuccessMessageProps): React.JSX.Element {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export function CamerasTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onPageChange = () => {
    /* No implementation needed */
  },
  onRowsPerPageChange = () => {
    /* No implementation needed */
  },
  onEdit = async () => {
    /* No implementation needed */
  },
  onDelete = async () => {
    /* No implementation needed */
  },
}: CamerasTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => {
    return rows.map((camera) => camera.id);
  }, [rows]);

  const { user } = useUser();
  const { selected } = useSelection(rowIds);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [alertOpen, setAlertOpen] = React.useState(false);

  const handleCloseAlert = (): void => {
    setAlertOpen(false);
    setSuccessMessage(null);
  };

  const handleEdit = async (row: CamerasParams): Promise<void> => {
    onEdit(row);
  };

  const handleDelete = async (userId: number): Promise<void> => {
    await onDelete(userId);
  };

  return (
  <>
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '15%' }}>Nombre</TableCell>
              <TableCell style={{ width: '65%' }}>Descripción</TableCell>
              {user?.role !== 'viewer' && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role !== 'viewer' ? 3 : 2} align="center">
                  No hay cámaras disponibles
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isSelected = selected?.has(row.id);
                return (
                  <TableRow hover key={row.id} selected={isSelected}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    {user?.role !== 'viewer' && (
                      <TableCell>
                        <Button startIcon={<PencilIcon />} onClick={() => handleEdit(row)}>
                          Editar
                        </Button>
                        {user?.role !== 'cashier' && (
                          <Button startIcon={<TrashIcon />} color="error" onClick={() => handleDelete(row.id)}>
                            Eliminar
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count} // Total de cámaras
        page={page} // Página actual
        onPageChange={onPageChange} // Maneja el cambio de página
        rowsPerPage={rowsPerPage} // Filas por página
        onRowsPerPageChange={onRowsPerPageChange} // Maneja el cambio de filas por página
        rowsPerPageOptions={[5, 10, 25]} // Opciones de filas por página
        labelRowsPerPage="Filas por página"
      />
    </Card>
          <SuccessMessage
          open={alertOpen}
          message={successMessage || ''}
          onClose={handleCloseAlert}
        />
      </>
  );
}