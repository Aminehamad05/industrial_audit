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
            role: 'Administrator',
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
      division: string
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
          division,
        }),
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
      return fetch(`${BASE_URL}/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
    rejectUser: async (userId: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/admin/users/${userId}/reject`, {
        method: 'PATCH',
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
      return fetch(`${BASE_URL}/admin/users/${userId}/unblock`, {
        method: 'PATCH',
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
    list: async (status?: string): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const url = status ? `${BASE_URL}/audits?status=${status}` : `${BASE_URL}/audits`;
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
  plants: {
    list: async (): Promise<Response> => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      return fetch(`${BASE_URL}/plants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
};

export default api;