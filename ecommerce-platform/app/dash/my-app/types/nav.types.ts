import { AdminRole } from './admin-user.types';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  iconName: string;
  badgeCount?: number;
  rolesAllowed?: AdminRole[];
  children?: NavItem[];
}

export interface NavGroup {
  id: string;
  title?: string;
  items: NavItem[];
}
