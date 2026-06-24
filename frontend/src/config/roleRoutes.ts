export const ROLE_HOME_ROUTES: Record<string, string> = {
  Administrator: '/admin/dashboard',
  Supervisor: '/supervisor/dashboard',
  Auditor: '/auditor/dashboard',
  MaintenanceTechnician: '/technician/dashboard',
};

export function getHomeRouteForRole(role: string): string {
  return ROLE_HOME_ROUTES[role] ?? '/login';
}