import { MenuItem } from '../models/sidebar';

const createMenuItem = (
  id: string,
  name: string,
  path: string,
  icon?: MenuItem['icon'],
  options: Partial<Omit<MenuItem, 'id' | 'name' | 'path' | 'icon'>> = {}
): MenuItem => ({
  id,
  name,
  path,
  icon,
  ...options,
});


export const menuItems: MenuItem[] = [
  createMenuItem('iam', 'IAM', '/identity-management', 'Users', {
    isIntegrated: true,
  }),
  createMenuItem('teams', 'Teams', '/teams', 'Shield'),
  createMenuItem('tournaments', 'Tournaments', '/tournaments', 'Trophy'),
  createMenuItem('matches', 'Matches', '/matches', 'Swords'),
];
