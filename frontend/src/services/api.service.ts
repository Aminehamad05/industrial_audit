const BASE_URL = 'http://localhost:3000';

export interface UserSession {
  token: string;
  user: {
    id: string;
    fullName: string;
    role: string;
  };
}

const api = {
  auth: {
    login: async (email: string, password: string): Promise<Response> => {
      // 1. First try the standard login endpoint
      try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          return response;
        }

        // If the server rejected it but it's the specific test credentials,
        // we can proceed to try logMe.
        if (response.status === 401 || response.status === 400 || response.status === 404) {
          if (email === 'admin' && password === 'Welcome') {
            return await api.auth.tryLogMe(email, password);
          }
        }

        return response;
      } catch (err) {
        // If the server is offline or connection fails, check if we have the local test credentials
        if (email === 'admin' && password === 'Welcome') {
          return await api.auth.tryLogMe(email, password);
        }
        throw err;
      }
    },

    tryLogMe: async (username: string, password: string): Promise<Response> => {
      const response = await fetch(`${BASE_URL}/auth/logMe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return response;
      }

      const data = await response.json();
      if (data.success) {
        // Normalize the mock logMe response to match the standard UserSession structure
        const normalizedData: UserSession = {
          token: 'mock-admin-token-jwt-secret-hutchinson',
          user: {
            id: 'mock-admin-uuid-0000-000000000000',
            fullName: data.data?.name || 'Salah Tounsi',
            role: 'ADMINISTRATOR',
          },
        };

        // Return a mock Response object so the page logic works seamlessly
        return new Response(JSON.stringify(normalizedData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: data.msg || 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    },

    register: async (
      username: string,
      email: string,
      password: string,
      fullName: string,
      role: string,
      plant: string,
      mentorName?: string
    ): Promise<Response> => {
      return fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          fullName,
          role,
          plant,
          mentorName,
        }),
      });
    },
    getSupervisors: async (): Promise<Response> => {
      return fetch(`${BASE_URL}/auth/supervisors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
  },
  admin: {
    getUsers: async (status?: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = status ? `${BASE_URL}/admin/users?status=${status}` : `${BASE_URL}/admin/users`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    approveUser: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    rejectUser: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    blockUser: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    unblockUser: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    getSupervisorsForAuditor: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/supervisors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    assignSupervisorForPlant: async (userId: string, plantId: number, supervisorId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/supervisors/${plantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ supervisorId }),
      });
    },
    removeSupervisorForPlant: async (userId: string, plantId: number): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/supervisors/${plantId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
  audits: {
    dashboard: async (): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/audits/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    kpis: async (params?: {
      plantId?: number;
      auditorLogin?: string;
      auditType?: string;
      from?: string;
      to?: string;
    }): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const queryParts: string[] = [];
      if (params?.plantId) queryParts.push(`plantId=${params.plantId}`);
      if (params?.auditorLogin) queryParts.push(`auditorLogin=${encodeURIComponent(params.auditorLogin)}`);
      if (params?.auditType) queryParts.push(`auditType=${encodeURIComponent(params.auditType)}`);
      if (params?.from) queryParts.push(`from=${params.from}`);
      if (params?.to) queryParts.push(`to=${params.to}`);
      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      return fetch(`${BASE_URL}/audits/kpis${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    list: async (params?: { status?: string; auditorLogin?: string; supervisorId?: string; unassignedOnly?: boolean }): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const queryParts: string[] = [];
      if (params?.status) queryParts.push(`status=${params.status}`);
      if (params?.auditorLogin) queryParts.push(`auditorLogin=${params.auditorLogin}`);
      if (params?.supervisorId) queryParts.push(`supervisorId=${params.supervisorId}`);
      if (params?.unassignedOnly) queryParts.push('unassignedOnly=true');
      
      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const url = `${BASE_URL}/audits${queryString}`;
      
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    getById: async (id: number): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/audits/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    create: async (data: Record<string, unknown>): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/audits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    createDetails: async (auditId: number, details: Record<string, unknown>[]): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/audits/${auditId}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      });
    },
    reassign: async (auditId: number, auditorId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/audits/${auditId}/reassign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ auditorId }),
      });
    },
  },
  schedules: {
    calendar: async (params: { year: number; month: number; plantId?: number }): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const queryParts = [`year=${params.year}`, `month=${params.month}`];
      if (params.plantId) queryParts.push(`plantId=${params.plantId}`);
      return fetch(`${BASE_URL}/schedules/calendar?${queryParts.join('&')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    list: async (plantId?: number): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = plantId ? `${BASE_URL}/schedules?plantId=${plantId}` : `${BASE_URL}/schedules`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    get: async (id: number): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/schedules/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    create: async (data: any): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    update: async (id: number, data: any): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    delete: async (id: number): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
  plants: {
    list: async (): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return fetch(`${BASE_URL}/plants`, {
        method: 'GET',
        headers,
      });
    },
  },
  shifts: {
    list: async (): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/shifts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },
  },
  supervisor: {
    getAuditors: async (): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/supervisor/auditors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
};

export default api;