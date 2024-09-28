'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { MenuItem, Select } from '@mui/material';

const schema = zod.object({
  name: zod.string().min(1, { message: 'El nombre de usuario es requerido' }),
  email: zod.string().min(1, { message: 'El correo electrónico es requerido' }).email(),
  password: zod.string().min(6, { message: 'La contraseña debe tener al menos 6 carácteres' }),
  confirmPassword: zod
    .string()
    .min(6, { message: 'La confirmación de contraseña debe tener al menos 6 carácteres' }),
  role: zod.string().min(1, { message: 'El tipo de usuario es requerido' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas deben coincidir',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = {
  role: 'admin',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error, message } = await authClient.signUp({...values, phoneNumber: '123456789'});

      if (error) {
        // Establecer el error del servidor
        setError('root', { type: 'server', message: error });
      } else if (message) {
        // Establecer el mensaje de éxito como si fuera un "error" en un campo ficticio
        setError('root.success', { type: 'success', message });
      }

      setIsPending(false);
    },
    [setError]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Registro de Usuario</Typography>
        <Typography color="text.secondary" variant="body2">
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Inicia sesión
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <FormControl error={Boolean(errors.role)}>
                <InputLabel>Tipo de usuario</InputLabel>
                <Select {...field} label="Tipo de usuario">
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="almacen">Usuario de almacén</MenuItem>
                  <MenuItem value="vendedor">Vendedor</MenuItem>
                  <MenuItem value="gestor">Gestor alimentario</MenuItem>
                </Select>
                {errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormControl error={Boolean(errors.name)}>
                <InputLabel>Nombre de usuario</InputLabel>
                <OutlinedInput {...field} label="User name" />
                {errors.name ? <FormHelperText>{errors.name.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Correo electrónico</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Contraseña</InputLabel>
                <OutlinedInput {...field} label="Password" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)}>
                <InputLabel>Confirmar contraseña</InputLabel>
                <OutlinedInput {...field} label="Confirm Password" type="password" />
                {errors.confirmPassword ? (
                  <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />
          {errors.root && errors.root.message ? <Alert color="error">{errors.root.message}</Alert> : null}

          {/* Mostrar mensaje de éxito */}
          {errors['root.success'] && errors['root.success'].message ? (
            <Alert color="success">{errors['root.success'].message}</Alert>
          ) : null}

          <Button disabled={isPending} type="submit" variant="contained">
            Regístrate
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
