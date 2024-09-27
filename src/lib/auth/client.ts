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
  middleName: string;
  lastName: string;
  secondlastName: string;
  email: string;
  phone: string;
  password: string;
  userType: string;
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

// Define el tipo para la respuesta del login
interface LoginResponse {
  access_token?: string; // Cambia a opcional ya que puede no estar presente en caso de error
  error?: string; // Define si el error puede estar en la respuesta
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Autenticación social no implementada' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
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
        return { error: data.error || 'Credenciales Invalidas' }; // Manejo seguro del error
      }
  
      const token = (data as LoginResponse).access_token; // Aserción de tipo
      if (token) {
        return { error: 'Token not found' }; // Manejo seguro del caso en que no se recibe el token
        
      }

      return {};
    } catch (error) {
      console.error(error); // Manejo del error de red
      return { error: 'Error de red' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'La recuperación de contraseña no está implementado' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'La actualización de contraseña no está implementado' };
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
}

export const authClient = new AuthClient();
