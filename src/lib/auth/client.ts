'use client';

import type { User } from '@/types/user';
import { API_URL } from '@/config';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user: User = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
};

export interface SignUpParams {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  phone: string;
  password: string;
  phoneNumber?: string;
  role: string;
}

export interface SimpleMessageResponse {
  message: string;
}

export interface DefaultErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface RegisterResponse {
  message: string;
}

export interface SupermarketSignUpParams {
  supermarketName: string;
  location: string;
  addressNumber: string;
  addressDetail: string;
  addressType: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  password: string;
  token: string;
}

// Define el tipo para la respuesta del login
interface LoginResponse {
  access_token?: string; // Cambia a opcional ya que puede no estar presente en caso de error
  error?: string; // Define si el error puede estar en la respuesta
  message?: string;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string; message?: string | null }> {
    const { email, password, role, firstName, middleName, lastName, secondLastName, phoneNumber } = params;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, middleName, lastName, secondLastName, email, password, role, phoneNumber }),
      });

      if (!response.ok) {
        const errorResponse: DefaultErrorResponse = await response.json();

        const errorMessage = errorResponse.message || 'Error signing up';
        return { error: errorMessage };
      }

      const data: RegisterResponse = await response.json();

      return { message: data.message };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  async supermarketsignUp(_: SupermarketSignUpParams): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Autenticación social no implementada' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; message?: string }> {
    const { email, password } = params;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Asegúrate de que el tipo de 'data' sea del tipo esperado
      const data: LoginResponse = await response.json();

      if (!response.ok) {
        return { error: 'Usuario y/o contraseña incorrectos' }; // Manejo seguro del error
      }

      const token = data.access_token; // Aserción de tipo
      if (token) {
        return { error: 'Token not found' }; // Manejo seguro del caso en que no se recibe el token
      }

      return {};
    } catch (error) {
      return { error: 'Error de red' };
    }
  }

  async resetPassword(params: ResetPasswordParams): Promise<{ error?: string | null }> {
    try {
      const { email } = params;
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error confirming account' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Failed to reset account password' };
    }
  }

  async updatePassword(params: UpdatePasswordParams): Promise<{ error?: string | null }> {
    const { password } = params;
    try {
      const response = await fetch(`${API_URL}/auth/reset-password?token=${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json() as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error updating password' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Failed to update password' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }
    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    return {};
  }

  async confirmAccount({ token }: { token: string }): Promise<{ error?: string | null }> {
    try {
      const response = await fetch(`${API_URL}/auth/confirm?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error confirming account' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Failed to confirm account' };
    }
  }
}

export const authClient = new AuthClient();
