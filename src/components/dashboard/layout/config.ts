import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { 
    key: 'home', 
    title: 'Inicio', 
    href: paths.dashboard.overview, 
    icon: 'house',
  },
  { 
    key: 'supermarket', 
    title: 'Supermercado', 
    href: paths.dashboard.supermarket, 
    icon: 'shopping-cart',
  },
  { 
    key: 'customers', 
    title: 'Usuarios', 
    href: paths.dashboard.customers, 
    icon: 'users',
    roles: ['admin', 'owner', 'viewer']
  },
  { 
    key: 'inventory', 
    title: 'Inventario', 
    href: paths.dashboard.integrations, 
    icon: 'box',
  },
  { 
    key: 'account', 
    title: 'Cuenta', 
    href: paths.dashboard.account, 
    icon: 'user',
  },
  { 
    key: 'settings', 
    title: 'Configuración', 
    href: paths.dashboard.settings, 
    icon: 'gear-six',
    roles: ['admin', 'owner']
  },
];