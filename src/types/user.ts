import type { Categories } from '@/components/dashboard/categories/categories-table';
import type { SupermarketSignUpParams, UploadImageParams, PredictionsParams} from '@/lib/auth/client';


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
  prediction?: PredictionsParams;
  category?: Categories;
  [key: string]: unknown;
}