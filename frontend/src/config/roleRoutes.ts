export const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMINISTRATOR: '/admin/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  AUDITOR: '/auditor/dashboard',
};

export function getHomeRouteForRole(role: string): string {
  return ROLE_HOME_ROUTES[role] ?? '/login';
}