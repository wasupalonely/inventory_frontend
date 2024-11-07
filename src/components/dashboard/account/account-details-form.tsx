  'use client';

  import * as React from 'react';
  import Card from '@mui/material/Card';
  import CardContent from '@mui/material/CardContent';
  import CardHeader from '@mui/material/CardHeader';
  import Divider from '@mui/material/Divider';
  import FormControl from '@mui/material/FormControl';
  import InputLabel from '@mui/material/InputLabel';
  import OutlinedInput from '@mui/material/OutlinedInput';
  import Grid from '@mui/material/Unstable_Grid2';
  import Button from '@mui/material/Button';
  import Snackbar from '@mui/material/Snackbar';
  import Alert from '@mui/material/Alert';
  import { useUser } from '@/hooks/use-user';
  import { API_URL } from '@/config';
  import Dialog from '@mui/material/Dialog';
  import DialogActions from '@mui/material/DialogActions';
  import DialogContent from '@mui/material/DialogContent';
  import DialogTitle from '@mui/material/DialogTitle';
  import { authClient } from '@/lib/auth/client';
  import TextField from '@mui/material/TextField';
  import CircularProgress from '@mui/material/CircularProgress';
  import Box from '@mui/material/Box';
  import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
  import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';

  export function AccountDetailsForm(): React.JSX.Element {
    const { user } = useUser();
    const [userData, setUserData] = React.useState({
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      secondLastName: user?.secondLastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    const [isEditing, setIsEditing] = React.useState(false);
    const [originalData, setOriginalData] = React.useState(userData);
    const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
    const [alertType, setAlertType] = React.useState<'success' | 'error'>('success');
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
    const [passwordValues, setPasswordValues] = React.useState({ password: '', newPassword: '', confirmPassword: '' });
    const [isPending, setIsPending] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState<boolean>();
    const [showNewPassword, setShowNewPassword] = React.useState<boolean>();
    const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>()

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setUserData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

    const hasChanges = () => {
      return JSON.stringify(userData) !== JSON.stringify(originalData);
    };

    const toggleEditMode = async () => {
      if (isEditing) {
        if (hasChanges()) {
          try {
            const response = await fetch(`${API_URL}/users/${user?.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('custom-auth-token')}`,
              },
              body: JSON.stringify(userData),
            });

            if (!response.ok) {
              const errorData = await response.text();
              throw new Error(
                `Error al actualizar los datos: ${response.status} ${response.statusText} - ${errorData}`
              );
            }

            setAlertMessage('Datos actualizados exitosamente');
            setAlertType('success');
            setOriginalData(userData); // Actualizamos los datos originales
          } catch (error) {
            setAlertMessage('Error al actualizar los datos');
            setAlertType('error');
          } finally {
            setIsAlertOpen(true);
          }
        } else {
          setAlertMessage('No hay cambios para guardar');
          setAlertType('error');
          setIsAlertOpen(true);
        }
      }
      setIsEditing((prev) => !prev);
    };

    const handleCloseAlert = () => {
      setIsAlertOpen(false);
      setAlertMessage(null);
    };

    const handlePasswordDialogClose = () => {
      setIsPasswordDialogOpen(false);
      setPasswordValues({ password: '', newPassword: '', confirmPassword: '' });
    };

    const handlePasswordChange = React.useCallback(async () => {
      setIsPending(true); // Iniciamos el proceso de carga
    
      if (!user?.id) {
        setAlertMessage('No se pudo obtener el ID del usuario.');
        setAlertType('error');
        setIsAlertOpen(true);
        setIsPending(false);
        return;
      }
    
      // 1. Comparamos la contraseña antigua con la que ingresó el usuario
      const { error: compareError, message } = await authClient.comparePasswordByUserId({
        userId: user.id.toString(),
        password: passwordValues.password, // Contraseña actual
      });
    
      if (compareError) {
        // 2. Si hay error en la comparación, mostramos mensaje
        setAlertMessage('Contraseña antigua incorrecta');
        setAlertType('error');
        setIsAlertOpen(true);
        setIsPending(false);
        return;
      }
    
      // 3. Validamos si la nueva contraseña es igual a la antigua
      if (message) {
        setAlertMessage('La nueva contraseña no puede ser la misma que la anterior');
        setAlertType('error');
        setIsAlertOpen(true);
        setIsPending(false);
        return;
      }
    
      // 4. Si todo está bien, intentamos actualizar la contraseña
      const { error: updateError } = await authClient.updatePassword({
        password: passwordValues.newPassword, // Nueva contraseña
        token: localStorage.getItem('custom-auth-token') as string, // Token de autenticación
      });
    
      if (updateError) {
        // 5. Si la nueva contraseña no cumple con los requisitos, mostramos el error
        setAlertMessage('La contraseña debe tener entre 9 y 20 caracteres, incluir mayúsculas, números y caracteres especiales.');
        setAlertType('error');
        setIsAlertOpen(true);
      } else {
        // 6. Contraseña actualizada con éxito
        setAlertMessage('Contraseña cambiada exitosamente');
        setAlertType('success');
        handlePasswordDialogClose();
      }
    
      setIsAlertOpen(true);
      setIsPending(false);
    }, [user?.id, passwordValues, setIsAlertOpen, setAlertMessage, setIsPending]);
    

    const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
    };

    const toggleNewPasswordVisibility = (): void => {
      setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = (): void => {
      setShowConfirmPassword(!showConfirmPassword);
    };
    

    return (
      <Card>
        <CardHeader
          subheader="Información de perfil"
          title="Perfil"
          action={
            <>
              <Button onClick={toggleEditMode} variant="contained" color="primary">
                {isEditing ? 'Guardar' : 'Editar'}
              </Button>
              <Button onClick={() => {setIsPasswordDialogOpen(true)}} variant="outlined" color="secondary" sx={{ ml: 2 }}>
                Cambiar Contraseña
              </Button>
            </>
          }
        />
        <Divider />

        {!isEditing && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primer nombre</InputLabel>
                  <OutlinedInput label="Primer nombre" value={userData.firstName} readOnly />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Segundo nombre</InputLabel>
                  <OutlinedInput label="Segundo nombre" value={userData.middleName} readOnly />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primer Apellido</InputLabel>
                  <OutlinedInput label="Primer apellido" value={userData.lastName} readOnly />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Segundo Apellido</InputLabel>
                  <OutlinedInput label="Segundo apellido" value={userData.secondLastName} readOnly />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Correo electrónico</InputLabel>
                  <OutlinedInput label="Correo electrónico" value={userData.email} readOnly />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Número de celular</InputLabel>
                  <OutlinedInput label="Número de celular" value={userData.phoneNumber} readOnly />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        )}

        {/* Formulario editable */}
        {isEditing && (
          <CardContent>
            <Grid container spacing={3}>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primer nombre</InputLabel>
                  <OutlinedInput
                    label="Primer nombre"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Segundo nombre</InputLabel>
                  <OutlinedInput
                    label="Segundo nombre"
                    name="middleName"
                    value={userData.middleName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Primer Apellido</InputLabel>
                  <OutlinedInput
                    label="Primer apellido"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Segundo Apellido</InputLabel>
                  <OutlinedInput
                    label="Segundo apellido"
                    name="secondLastName"
                    value={userData.secondLastName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid md={6} xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Número de celular</InputLabel>
                  <OutlinedInput
                    label="Número de celular"
                    name="phoneNumber"
                    type="tel"
                    value={userData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        )}
          <Dialog open={isPasswordDialogOpen} onClose={handlePasswordDialogClose}>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogContent>
              <TextField
              InputProps={{
                endAdornment: (
                  <button type="button" onClick={togglePasswordVisibility} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                ),
              }}
                name="password"
                label="Contraseña Antigua"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={passwordValues.password}
                onChange={(e) => {setPasswordValues({ ...passwordValues, password: e.target.value })}}
                margin="dense"
              />
              <Box sx={{ mt: 3 }} />
              <TextField
                InputProps={{
                  endAdornment: (
                    <button type="button" onClick={toggleNewPasswordVisibility} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                      {showNewPassword ? <EyeIcon /> : <EyeSlashIcon />}
                    </button>
                  ),
                }}
                name="password"
                label="Nueva Contraseña"
                type={showNewPassword ? 'text' : 'password'}
                fullWidth
                value={passwordValues.newPassword}
                onChange={(e) => {setPasswordValues({ ...passwordValues, newPassword: e.target.value })}}
                margin="dense"
              />
              <TextField
              InputProps={{
                endAdornment: (
                  <button type="button" onClick={toggleConfirmPasswordVisibility} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                  </button>
                ),
              }}
                name= "confirmPassword"
                label="Confirmar Nueva Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={passwordValues.confirmPassword}
                onChange={(e) => {setPasswordValues({ ...passwordValues, confirmPassword: e.target.value })}}
                margin="dense"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePasswordDialogClose} color="error">
                Cancelar
              </Button>
              <Button onClick={handlePasswordChange} color="primary" disabled={isPending}>
                {isPending ? <CircularProgress size={24} /> : 'Cambiar'}
              </Button>
            </DialogActions>
          </Dialog>
        <Snackbar open={isAlertOpen} autoHideDuration={3000} onClose={handleCloseAlert}>
          <Alert onClose={handleCloseAlert} severity={alertType} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
      </Card>
    );
  }