import type { SupermarketSignUpParams } from "@/lib/auth/client";

export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  ownedSupermarket?: SupermarketSignUpParams | null;  // Supermercado que posee el usuario (puede ser null si no tiene)

  [key: string]: unknown;
}
