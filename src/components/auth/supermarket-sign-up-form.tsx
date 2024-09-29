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

import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  supermarketName: zod
    .string()
    .min(1, { message: 'El nombre del supermercado es requerido' })
    .max(255, { message: 'El nombre del supermercado no debe tener más de 255 caracteres' }),
  location: zod
    .string()
    .min(1, { message: 'El barrio es requerido' })
    .max(255, { message: 'El barrio no debe tener más de 255 caracteres' }),
  addressType: zod.string().min(1, { message: 'El tipo de calle es requerida' }),
  addressNumber: zod.string().min(1, { message: 'La calle es requerida' }),
  addressDetail: zod.string().min(1, { message: 'El número es requerido' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  supermarketName: '',
  location: '',
  addressType: '',
  addressNumber: '',
  addressDetail: '',
} satisfies Values;

export function SupermarketSignUpForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.supermarketsignUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      checkSession?.();
      router.refresh();
    },
    [router, setError]
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
            name="supermarketName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.supermarketName)}>
                <InputLabel>Nombre del supermercado</InputLabel>
                <OutlinedInput {...field} label="Supermarket name" />
                {errors.supermarketName ? <FormHelperText>{errors.supermarketName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <FormControl error={Boolean(errors.location)}>
                <InputLabel>Barrio</InputLabel>
                <OutlinedInput {...field} label="Location" />
                {errors.location ? <FormHelperText>{errors.location.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Controller
                control={control}
                name="addressType"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.addressType)} fullWidth>
                    <InputLabel>Tipo de calle</InputLabel>
                    <Select {...field} label="Tipo de Vía">
                      <MenuItem value="avenida">Avenida</MenuItem>
                      <MenuItem value="avenida calle">Avenida Calle</MenuItem>
                      <MenuItem value="avenida carrera">Avenida Carrera</MenuItem>
                      <MenuItem value="calle">Calle</MenuItem>
                      <MenuItem value="carrera">Carrera</MenuItem>
                      <MenuItem value="circular">Circular</MenuItem>
                      <MenuItem value="circunvalar">Circunvalar</MenuItem>
                      <MenuItem value="diagonal">Diagonal</MenuItem>
                      <MenuItem value="manzana">Manzana</MenuItem>
                      <MenuItem value="transversal">Transversal</MenuItem>
                      <MenuItem value="via">Vía</MenuItem>
                    </Select>
                    {errors.addressType ? <FormHelperText>{errors.addressType.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                control={control}
                name="addressNumber"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Calle"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                    error={Boolean(errors.addressNumber)}
                    helperText={errors.addressNumber?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={4}>
              <Controller
                control={control}
                name="addressDetail"
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Número"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">-</InputAdornment>,
                    }}
                    error={Boolean(errors.addressDetail)}
                    helperText={errors.addressDetail?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={!isValid || isPending} type="submit" variant="contained">
            Registrar supermercado
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
// Example of fake API signup function (replace with actual API)
// async function fakeSignUp(values: Values): Promise<{ error?: string }> {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ error: '' });
//     }, 2000);
//   });
// }
function checkSession(): void {
  throw new Error('Function not implemented.');
}
