'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@mui/material';
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

const schema = zod
  .object({
    password: zod.string()
      .min(9, { message: 'La nueva contraseña debe tener al menos 9 caracteres' })
      .max(20, { message: 'La nueva contraseña no debe tener más de 20 caracteres' })
      .regex(/[A-Z]/, { message: 'La nueva contraseña debe contener al menos una letra mayúscula' })
      .regex(/[a-z]/, { message: 'La nueva contraseña debe contener al menos una letra minúscula' })
      .regex(/\d/, { message: 'La nueva contraseña debe contener al menos un número' })
      .regex(/[\W_]/, { message: 'La nueva contraseña debe contener al menos un carácter especial' }),
    confirmPassword: zod.string()
      .min(9, { message: 'La confirmación de la nueva contraseña debe tener al menos 9 caracteres' })
      .max(20, { message: 'La confirmación de la nueva contraseña no debe tener más de 20 caracteres' })
      .regex(/[A-Z]/, { message: 'La confirmación de la nueva contraseña debe contener al menos una letra mayúscula' })
      .regex(/[a-z]/, { message: 'La confirmación de la nueva contraseña debe contener al menos una letra minúscula' })
      .regex(/\d/, { message: 'La confirmación de la nueva contraseña debe contener al menos un número' })
      .regex(/[\W_]/, { message: 'La confirmación de la nueva contraseña debe contener al menos un carácter especial' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }
  });

type Values = zod.infer<typeof schema>;

const defaultValues = { password: '', confirmPassword: '' } satisfies Values;

export function UpdatePasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const userId = searchParams.get('id');
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [usedToken, setUsedToken] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    const isUsedToken = async (): Promise<void> => {
      const used = await authClient.validateToken({ token: token as string });
      setUsedToken(used.message!);
    };

    isUsedToken();

  }, [token, router]);

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error: compareError, message } = await authClient.comparePasswordByUserId({
        userId: userId as string,
        password: values.password,
      });

      if (compareError) {
        setError('root', { type: 'server', message: compareError });
        setIsPending(false);
        return;
      }

      if (message) {
        setError('root', { type: 'server', message: 'La contraseña no puede ser la misma que la anterior' });
        setIsPending(false);
        return;
      }

      const { error } = await authClient.updatePassword({
        password: values.password,
        token: token as string,
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setSuccessMessage('Enlace de confirmación enviado exitosamente, por favor revisa tu correo electrónico');

      reset();

      setIsPending(false);
      router.push('/auth/sign-in');
    },
    [setError, reset, router, token]
  );

  return (
    <Stack spacing={4}>
      {usedToken ? (
        <Alert color="error">Enlace no válido</Alert>
      ) : (
        <>
          <Typography variant="h5">Actualizar contraseña</Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.password)}>
                    <InputLabel>Nueva contraseña</InputLabel>
                    <OutlinedInput {...field} label="Nueva contraseña" type="password" />
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
                    <OutlinedInput {...field} label="Confirmar contraseña" type="password" />
                    {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
              {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
              {successMessage ? <Alert color="success">{successMessage}</Alert> : null}
              <Button disabled={!isValid || isPending} type="submit" variant="contained">
                Actualizar
              </Button>
            </Stack>
          </form>
        </>
      )}
    </Stack>
  );
}
