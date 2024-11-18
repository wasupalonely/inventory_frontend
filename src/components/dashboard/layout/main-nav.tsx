'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import type { PredictionsParams } from '@/lib/auth/client';
import type { User } from '@/types/user';
import { API_URL } from '@/config';
import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface MainNavProps {
  predictions: PredictionsParams[];
}

export function MainNav({ predictions }: MainNavProps): React.JSX.Element {
  const [, setPredictions] = React.useState<PredictionsParams[]>([]);
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const user: User = JSON.parse(localStorage.getItem('user') || '{}');
  const [avatarUrl] = React.useState<string>(
    typeof user?.profileImage === 'string'
      ? user.profileImage
      : localStorage.getItem('avatarUrl') || '/assets/default-avatar.png'
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  const showSnackbar = (message: string, severity: 'success' | 'error'): void => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };


  React.useEffect(() => {
    const fetchNotifications = async (): Promise<void> => {
      try {
        const token = localStorage.getItem('custom-auth-token'); // Obtén el token
        const userMain: User = JSON.parse(localStorage.getItem('user') || '{}');
        const supermarketId = userMain?.supermarket?.id?.toString() || userMain?.ownedSupermarket?.id?.toString();

        const response = await fetch(`${API_URL}/notifications/supermarket/${supermarketId}`, {
          method: 'GET', // Método de la solicitud
          headers: {
            Authorization: `Bearer ${token}`, // Agrega el token en el header
          },
        });

        if (response.ok) {
          const data: PredictionsParams[] = await response.json();
          setPredictions(data); // Actualiza el estado con las notificaciones obtenidas
        } else {
          showSnackbar('Error al obtener notificaciones', 'error');
        }
      } catch (error) {
        showSnackbar('Error al obtener notificaciones', 'error');
      }
    };

    fetchNotifications();
  }, []); // Dependencias vacías para ejecutar solo una vez al montar el componente

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            <Tooltip title="Buscar">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notificaciones">
              <Badge badgeContent={predictions.length} color="success">
                <IconButton onClick={handleNotificationClick}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={avatarUrl}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ width: 350 }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            Notificaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Últimas actualizaciones de tus predicciones
          </Typography>
        </Box>

        <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
          <List>
            {predictions.map((prediction) => (
              <React.Fragment key={prediction.id}>
                <ListItem button>
                  <ListItemIcon>
                    <BellIcon size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={prediction.result}
                    secondary={typeof prediction.image === 'string' ? prediction.image : 'Sin imagen'}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button fullWidth variant="text" onClick={handleNotificationClose}>
            Ver todas las notificaciones
          </Button>
        </Box>
      </Popover>

      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
