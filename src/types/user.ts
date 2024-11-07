import { type SupermarketSignUpParams, UploadImageParams } from '@/lib/auth/client';


export interface User {
  id: number;
  profileImage?: UploadImageParams;
  email: string;
  ownedSupermarket?: SupermarketSignUpParams;

  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  phoneNumber: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: 'owner' | 'cashier' | 'admin' | 'viewer';
  supermarket?: SupermarketSignUpParams;
  [key: string]: unknown;
}
