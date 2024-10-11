'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, InputAdornment, MenuItem, Select, TextField } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient, DefaultErrorResponse } from '@/lib/auth/client';
import { API_URL } from '@/config';
import { useUser } from '@/hooks/use-user';

// Esquema de validación actualizado
const schema = zod.object({
  name: zod.string()
    .min(1, { message: 'El nombre del supermercado es requerido' })
    .max(255, { message: 'El nombre del supermercado no debe tener más de 255 caracteres' }),
  neighborhood: zod.string().max(255, { message: 'El barrio es requerido' }),
  locationType: zod.string().min(1, { message: 'El tipo de ubicación es requerido' }),
  streetNumber: zod.string().max(20, { message: 'El número de la calle es requerido' }),
  intersectionNumber: zod.string().max(20, { message: 'El número de intersección es requerido' }), // Requerido
  buildingNumber: zod.string().max(20, { message: 'El número de edificio es requerido' }), // Requerido
  additionalInfo: zod.string().max(255, { message: 'La información adicional es requerida' }), // Requerido
});

type Values = zod.infer<typeof schema>;

// Valores por defecto
const defaultValues = {
  name: '',
  neighborhood: '',
  locationType: '',
  streetNumber: '',
  intersectionNumber: '', // Opcional
  buildingNumber: '', // Opcional
  additionalInfo: '', // Opcional
} satisfies Values;

export function SupermarketSignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null); // Estado para el mensaje de error
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null); // Estado para el mensaje de exito
  const { checkSession } = useUser(); // Usar el hook de autenticación
  const [isPending, setIsPending] = React.useState<boolean>(false);
   // Función para cerrar sesión
   const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {

        return;
      }

      // Actualiza el estado de autenticación
      await checkSession?.();

      // Refresca el router manualmente si es necesario
      router.refresh();
    } catch (error) {
      setErrorMessage('Ocurrió un error al cerrar sesión');
    }
  }, [router]);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  //Endpoint
  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      try {
        const response = await fetch(`${API_URL}/supermarket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });


        if (!response.ok) {
          const errorData = await response.json() as { message: string };
          setError('root', { type: 'server', message: errorData.message });
          setIsPending(false);
          return;
        }

        await response.json();
        router.refresh();
      } catch (error) {
        setError('root', { type: 'server', message: 'Error al crear el supermercado' });
      } finally {

        setSuccessMessage('Supermercado creado exitosamente');

        reset();

        setIsPending(false);
      }

    },
    [router, reset, setError]
  );


  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Registro de Supermercado</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Nombre del supermercado</InputLabel>
                <OutlinedInput {...field} label="Nombre del supermercado" inputProps={{ maxLength: 255 }} />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Typography variant="h6">Dirección</Typography>
          <Controller
            control={control}
            name="neighborhood"
            render={({ field }) => (
              <FormControl error={Boolean(errors.neighborhood)}>
                <InputLabel>Barrio</InputLabel>
                <OutlinedInput {...field} label="Barrio" inputProps={{ maxLength: 255 }} />
                {errors.neighborhood ? <FormHelperText>{errors.neighborhood.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="locationType"
            render={({ field }) => (
              <FormControl error={Boolean(errors.locationType)}>
                <InputLabel>Tipo de ubicación</InputLabel>
                <Select {...field} label="Tipo de ubicación">
                    <MenuItem value="avenue">Avenida</MenuItem>
                    <MenuItem value="avenue_street">Avenida Calle</MenuItem>
                    <MenuItem value="avenue_road">Avenida Carrera</MenuItem>
                    <MenuItem value="street">Calle</MenuItem>
                    <MenuItem value="road">Carrera</MenuItem>
                    <MenuItem value="circular">Circular</MenuItem>
                    <MenuItem value="circunvalar">Circunvalar</MenuItem>
                    <MenuItem value="diagonal">Diagonal</MenuItem>
                    <MenuItem value="block">Manzana</MenuItem>
                    <MenuItem value="transversal">Transversal</MenuItem>
                    <MenuItem value="way">Vía</MenuItem>
                </Select>
                {errors.locationType ? <FormHelperText>{errors.locationType.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="streetNumber"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número de la calle"
                    inputProps={{ maxLength: 20 }}
                    error={Boolean(errors.streetNumber)}
                    helperText={errors.streetNumber?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="intersectionNumber"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número de intersección"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                    inputProps={{ maxLength: 20 }}
                    error={Boolean(errors.intersectionNumber)}
                    helperText={errors.intersectionNumber?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="buildingNumber"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número de edificio"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">-</InputAdornment>,
                    }}
                    inputProps={{ maxLength: 20 }}
                    error={Boolean(errors.buildingNumber)}
                    helperText={errors.buildingNumber?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
          <Controller
            control={control}
            name="additionalInfo"
            render={({ field }) => (
              <TextField
                {...field}
                label="Información adicional"
                inputProps={{ maxLength: 255 }}
                error={Boolean(errors.additionalInfo)}
                helperText={errors.additionalInfo?.message}
                fullWidth
              />
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
          <Button disabled={!isValid || isPending} type="submit" variant="contained">
            Registrar supermercado
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

// function checkSession(): void {
//   throw new Error('Function not implemented.');
// }
