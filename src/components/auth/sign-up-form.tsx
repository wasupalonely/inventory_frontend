'use client';

import * as React from 'react';
import InputMask from 'react-input-mask';
import RouterLink from 'next/link';
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
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  firstName: zod.string()
  .min(1, { message: 'El primer nombre es requerido' })
  .max(50, { message: 'El primer nombre no debe tener más de 50 caracteres' }),
  middleName: zod.string().optional(),
  lastName: zod.string()
  .min(1, { message: 'El primer apellido requerido' })
  .max(50, { message: 'El primer apellido no debe tener más de 50 caracteres' }),
  secondlastName: zod.string().optional(),
  email: zod.string()
  .min(1, { message: 'El correo electrónico es requerido' }).email()
  .max(255, { message: 'El correo electrónico no debe tener más de 255 caracteres' }),
  phone: zod.string()
    .min(9, { message: 'El número de celular debe tener al menos 9 caracteres' })
    .max(255, { message: 'El número de celular no debe tener más de 255 caracteres' }),
  password: zod.string()
    .min(9, { message: 'La contraseña debe tener al menos 9 caracteres' })
    .max(20, { message: 'La contraseña no debe tener más de 20 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
    .regex(/\d/, { message: 'La contraseña debe contener al menos un número' })
    .regex(/[\W_]/, { message: 'La contraseña debe contener al menos un carácter especial' }),
  confirmPassword: zod.string()
    .min(9, { message: 'La confirmación de contraseña debe tener al menos 9 caracteres' })
    .max(20, { message: 'La confirmación de contraseña no debe tener más de 20 caracteres' })
    .regex(/[A-Z]/, { message: 'La confirmación de contraseña debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La confirmación de contraseña debe contener al menos una letra minúscula' })
    .regex(/\d/, { message: 'La confirmación de contraseña debe contener al menos un número' })
    .regex(/[\W_]/, { message: 'La confirmación de contraseña debe contener al menos un carácter especial' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas deben coincidir',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', middleName: '', lastName: '', secondlastName: '', phone:'', email: '', password: '',  confirmPassword: ''} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  // const router = useRouter();
  // const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const [showPassword, setShowPassword] = React.useState<boolean>();

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
  name="firstName"
  render={({ field }) => (
    <FormControl error={Boolean(errors.firstName)} required>
      <InputLabel required>Primer nombre</InputLabel>
      <OutlinedInput {...field} label="First name" />
      {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="middleName"
  render={({ field }) => (
    <FormControl>
      <InputLabel>Segundo nombre</InputLabel>
      <OutlinedInput {...field} label="Middle name" />
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="lastName"
  render={({ field }) => (
    <FormControl error={Boolean(errors.lastName)} required>
      <InputLabel required>Primer apellido</InputLabel>
      <OutlinedInput {...field} label="Last name" />
      {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="secondlastName"
  render={({ field }) => (
    <FormControl>
      <InputLabel>Segundo apellido</InputLabel>
      <OutlinedInput {...field} label="Second last name" />
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="email"
  render={({ field }) => (
    <FormControl error={Boolean(errors.email)} required>
      <InputLabel required>Correo electrónico</InputLabel>
      <OutlinedInput {...field} label="Email address" type="email" />
      {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="phone"
  render={({ field }) => (
    <FormControl error={Boolean(errors.phone)} required>
      <InputLabel required>Número de celular</InputLabel>
      <InputMask
        {...field}
        mask="999-999-9999" 
        maskChar={null}
      >
        {(inputProps) => <OutlinedInput {...inputProps} label="Phone" />}
      </InputMask>
      {errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="password"
  render={({ field }) => (
    <FormControl error={Boolean(errors.password)} required>
      <InputLabel required>Contraseña</InputLabel>
      <OutlinedInput
        {...field}
        endAdornment={showPassword ? (
          <EyeIcon
            cursor="pointer"
            fontSize="var(--icon-fontSize-md)"
            onClick={(): void => { setShowPassword(false); }}
          />
        ) : (
          <EyeSlashIcon
            cursor="pointer"
            fontSize="var(--icon-fontSize-md)"
            onClick={(): void => { setShowPassword(true); }}
          />
        )}
        label="Password"
        type={showPassword ? 'text' : 'password'}
      />
      {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="confirmPassword"
  render={({ field }) => (
    <FormControl error={Boolean(errors.confirmPassword)} required>
      <InputLabel required>Confirmar contraseña</InputLabel>
      <OutlinedInput
        {...field}
        endAdornment={showPassword ? (
          <EyeIcon
            cursor="pointer"
            fontSize="var(--icon-fontSize-md)"
            onClick={(): void => { setShowPassword(false); }}
          />
        ) : (
          <EyeSlashIcon
            cursor="pointer"
            fontSize="var(--icon-fontSize-md)"
            onClick={(): void => { setShowPassword(true); }}
          />
        )}
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
      />
      {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
    </FormControl>
  )}
/>

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={!isValid || isPending} type="submit" variant="contained">
            Regístrate
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
