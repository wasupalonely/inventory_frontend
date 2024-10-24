'use client';

import type { User } from '@/types/user';
import { API_URL } from '@/config';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}



export interface SignUpParams {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  role: string;
  email: string;
  phone: string;
  password: string;
  phoneNumber?: string;
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
  name: string;
  address: {
    neighborhood: string;
    locationType: string;
    streetNumber: string;
    intersectionNumber: string;
    buildingNumber: string;
    additionalInfo: string;
  }
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
  user: User;
  access_token?: string; // Cambia a opcional ya que puede no estar presente en caso de error
  error?: string; // Define si el error puede estar en la respuesta
  message?: string;
}

class AuthClient {
  getPasswordHash(): { passwordHash: string; } | PromiseLike<{ passwordHash: string; }> {
    throw new Error('Método no implementado.');
  }
  async signUp(params: SignUpParams): Promise<{ error?: string; message?: string | null }> {
    const { email, password, firstName, middleName, lastName, secondLastName, phoneNumber, role } = params;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, middleName, lastName, secondLastName, email, password, phoneNumber, role }),
      });

      if (!response.ok) {
        const errorResponse: DefaultErrorResponse = await response.json();

        const errorMessage = errorResponse.message || 'Error al registrarse';
        return { error: errorMessage };
      }

      const data: RegisterResponse = await response.json();

      return { message: data.message };
    } catch (error) {

      return { error: 'Error de red' };
    }
  }

  async supermarketsignUp(params: SupermarketSignUpParams, _ownerId: string): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    try {
      // Realiza una petición para registrar el supermercado aquí
      const response = await fetch(`${API_URL}/supermarket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Añadir el token en el header
        },
        body: JSON.stringify(params), // Envía los parámetros como el cuerpo de la petición
      });

      if (!response.ok) {
        const errorResponse: DefaultErrorResponse = await response.json();
        return { error: errorResponse.message || 'Error al registrar el supermercado' };
      }
      const data = await response.json();
    

      // Si el registro es exitoso, puedes manejar la respuesta aquí
      return {};
    } catch (error) {
      return { error: 'Error de red al registrar el supermercado' };
    }
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

      const token = data.access_token;
      const user = data.user;
      const userId = data.user.id; // Aquí obtienes el ID del usuario // Aserción de tipo
      if (!token) {
        return { error: 'Token no encontrado' }; // Manejo seguro del caso en que no se recibe el token
      }
      
      if (!userId) {
        return { error: 'ID de usuario no encontrado' };
      }
      localStorage.setItem('custom-auth-token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', userId);
      
      

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

      const data = (await response.json()) as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error de confirmación de la cuenta' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Fallo al reiniciar la contraseña de la cuenta' };
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

      const data = (await response.json()) as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error actualizando contraseña' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Fallo al actualizar la contraseña' };
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    const userId = localStorage.getItem('userId'); // Obtener el userId de localStorage
  
    if (!token || !userId) {
      return { data: null, error: 'No token or userId found' }; // Manejo de errores si no hay token o userId
    }
  
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        return { data: null, error: 'Failed to fetch user data from server' };
      }
  
      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user)); // Actualiza localStorage con el usuario obtenido

      
  
      return { data: user };
    } catch (error) {
      return { data: null, error: 'Error fetching user data' };
    }
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

      const data = (await response.json()) as SimpleMessageResponse;

      if (!response.ok) {
        return { error: data.message || 'Error de confirmación de la cuenta' };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Fallo al confirmar la cuenta' };
    }
  }

  async validateToken({ token }: { token: string }): Promise<{ error?: string | null; message?: boolean }> {
    try {
      const response = await fetch(`${API_URL}/token/validate-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: boolean = await response.json();

      if (!response.ok) {
        return { error: 'Error validating token' };
      }

      return { error: null, message: data };
    } catch (err) {
      return { error: 'Failed to confirm account' };
    }
  }

  async comparePasswordByUserId({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }): Promise<{ error?: string | null; message?: boolean }> {
    try {
      const response = await fetch(`${API_URL}/users/compare-password/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data: boolean = await response.json();

      if (!response.ok) {
        return { error: 'Error comparing passwords' };
      }

      return { error: null, message: data };
    } catch (err) {
      return { error: 'Failed to confirm account' };
    }
  }

}

export const authClient = new AuthClient();