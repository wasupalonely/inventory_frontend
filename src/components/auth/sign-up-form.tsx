'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
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
  userType: zod.string().min(1, { message: 'El tipo de usuario es requerido' }),
  firstName: zod.string()
  .min(1, { message: 'El primer nombre es requerido' })
  .max(50, { message: 'El primer nombre no debe tener más de 50 caracteres' }),
  middleName: zod.string()
  .min(1, { message: 'El segundo nombre es requerido' })
  .max(50, { message: 'El segundo nombre no debe tener más de 50 caracteres' }),
  lastName: zod.string()
  .min(1, { message: 'El primer apellido requerido' })
  .max(50, { message: 'El primer apellido no debe tener más de 50 caracteres' }),
  secondlastName: zod.string()
  .min(1, { message: 'El segundo apellido requerido' })
  .max(50, { message: 'El segundo apellido no debe tener más de 50 caracteres' }),
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
    .regex(/[\W_]/, { message: 'La confirmación de contraseña debe contener al menos un carácter especial' }),
  terms: zod.boolean().refine((value) => value, 'Tienes que aceptar los términos y condiciones')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas deben coincidir',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { userType: '', firstName: '', middleName: '', lastName: '', secondlastName: '', phone:'', email: '', password: '',  confirmPassword: '',  terms: false,} satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

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

      const { error } = await authClient.signUp(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      await checkSession?.();
      router.refresh();
    },
    [checkSession, router, setError]
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
            name="userType"
            render={({ field }) => (
              <FormControl error={Boolean(errors.userType)}>
                <InputLabel>Tipo de usuario</InputLabel>
                <Select {...field} label="Tipo de usuario">
                  <MenuItem value="administrador">Administrador</MenuItem>
                </Select>
                {errors.userType ? <FormHelperText>{errors.userType.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.firstName)}>
                <InputLabel>Primer nombre</InputLabel>
                <OutlinedInput {...field} label="First name" />
                {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="middleName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.middleName)}>
              <InputLabel>Segundo nombre</InputLabel>
                <OutlinedInput {...field} label="Middle name" />
                {errors.middleName ? <FormHelperText>{errors.middleName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lastName)}>
                <InputLabel>Primer apellido </InputLabel>
                <OutlinedInput {...field} label="Last name" />
                {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="secondlastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.secondlastName)}>
                <InputLabel>Segundo apellido</InputLabel>
                <OutlinedInput {...field} label="Second last name" />
                {errors.secondlastName ? <FormHelperText>{errors.secondlastName.message}</FormHelperText> : null}
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
            name="phone"
            render={({ field }) => (
              <FormControl error={Boolean(errors.phone)}>
              <InputLabel>Número de celular</InputLabel>
                <OutlinedInput {...field} label="Phone" />
                {errors.phone ? <FormHelperText>{errors.phone.message}</FormHelperText> : null}
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
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
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
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={!isValid || isPending} type="submit" variant="contained">
            Regístrate
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}