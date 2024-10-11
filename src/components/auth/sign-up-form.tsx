'use client';

import * as React from 'react';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

const schema = zod.object({
  firstName: zod.string()
    .min(1, { message: 'El primer nombre es requerido' })
    .max(50, { message: 'El primer nombre no debe tener más de 50 caracteres' }),
  middleName: zod.string()
    .max(50,{ message: 'El segundo nombre no debe tener más de 50 caracteres' })
    .optional(),
  lastName: zod.string()
    .min(1, { message: 'El primer apellido requerido' })
    .max(50, { message: 'El primer apellido no debe tener más de 50 caracteres' }),
  secondlastName: zod.string()
    .max(50,{ message: 'El segundo apellido no debe tener más de 50 caracteres' })
    .optional(),
  email: zod.string()
    .email({ message: 'El correo electrónico es inválido' })
    .min(1, { message: 'El correo electrónico es requerido' })
    .max(255, { message: 'El correo electrónico no debe tener más de 255 caracteres' }),
  phone: zod.string()
    .min(10, { message: 'El número de celular debe tener al menos 10 caracteres' }),
  password: zod.string()
    .min(9, { message: 'La contraseña debe tener al menos 9 caracteres' })
    .max(20, { message: 'La contraseña no debe tener más de 20 caracteres' })
    .regex(/[A-Z]/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La contraseña debe contener al menos una letra minúscula' })
    .regex(/\d/, { message: 'La contraseña debe contener al menos un número' })
    .regex(/[\W_]/, { message: 'La contraseña debe contener al menos un carácter especial' }),
  role: zod.string(),
  confirmPassword: zod.string()
    .min(9, { message: 'La confirmación de contraseña debe tener al menos 9 caracteres' })
    .max(20, { message: 'La confirmación de contraseña no debe tener más de 20 caracteres' })
    .regex(/[A-Z]/, { message: 'La confirmación de contraseña debe contener al menos una letra mayúscula' })
    .regex(/[a-z]/, { message: 'La confirmación de contraseña debe contener al menos una letra minúscula' })
    .regex(/\d/, { message: 'La confirmación de contraseña debe contener al menos un número' })
    .regex(/[\W_]/, { message: 'La confirmación de contraseña debe contener al menos un carácter especial' }),
  terms: zod.boolean().refine((value) => value, 'Tienes que aceptar los términos y condiciones'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas deben coincidir',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', middleName: '', lastName: '', secondlastName: '', phone: '', email: '', password: '', confirmPassword: '', role: 'owner', terms: false } satisfies Values;


export function SignUpForm(): React.JSX.Element {

  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>();
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null); // Estado para el mensaje de éxito
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
    reset,
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = React.useCallback(
    
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setSuccessMessage(null);
      const { error, message } = await authClient.signUp({ ...values, phoneNumber: values.phone });

      if (error) {
        setError('root', { type: 'server', message: error });
        setSuccessMessage(null);
      } else if (message) {
        localStorage.setItem('canAccessConfirmation', 'true');
        setSuccessMessage('Registro exitoso, confirma tu correo electrónico');
        reset();
}
      setIsPending(false);
    },
    [setError, reset]
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
      <OutlinedInput {...field} label="Primer Nombre" inputProps={{ maxLength: 50 }}/>
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
      <OutlinedInput {...field} label="Segundo Nombre" inputProps={{ maxLength: 50 }} />
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="lastName"
  render={({ field }) => (
    <FormControl error={Boolean(errors.lastName)} required>
      <InputLabel required>Primer apellido</InputLabel>
      <OutlinedInput {...field} label="Primer Apellido" inputProps={{ maxLength: 50 }} />
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
      <OutlinedInput {...field} label="Segundo Apellido" inputProps={{ maxLength: 50 }} />
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="email"
  render={({ field }) => (
    <FormControl error={Boolean(errors.email)} required>
      <InputLabel required>Correo electrónico</InputLabel>
      <OutlinedInput {...field} label="Correo Electronico" type="email" inputProps={{ maxLength: 255 }} />
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
      <OutlinedInput
        {...field}
        label="Numero de Celular"
        inputProps={{ maxLength: 10 }}
        onKeyPress={(event) => {
          if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        }}
      />
      {errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
    </FormControl>
  )}
/>
<Controller
  control={control}
  name="password"
  render={({ field }) => (
    <FormControl error={Boolean(errors.password)} required>
      <InputLabel required>Contraseña </InputLabel>
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
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        inputProps={{ maxLength: 20 }}
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
        label="Confirmar contraseña"
        type={showPassword ? 'text' : 'password'}
        inputProps={{ maxLength: 20 }}
      />
      <Controller
            control={control}
            name="terms"
            render={({ field: inputfield }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...inputfield} />}
                  label={
                    <React.Fragment>
                      He leído los <Link>términos y condiciones</Link>
                    </React.Fragment>
                  }
                />
                {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
              </div>
            )}
          />
      {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
    </FormControl>
  )}
  
/>
        {Boolean(successMessage?.trim()) && ( // Asegúrate de que esto se renderiza
        <Alert severity="success">{successMessage}</Alert> // Mensaje de éxito
      )}

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={!isValid || isPending} type="submit" variant="contained">
            Regístrate
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
