export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status?: string; // Make status optional since it's not always present
  password?: string; // We won't use this on frontend but it comes from API
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  userId: number;
  user?: User; // For joined data
  createdAt?: string;
}

export interface Transaction {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description?: string;
  reference?: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  balance: number;
  accountId: number;
}

// Make sure all endpoints use the same base URL
const BASE_URL = 'http://localhost:8080/api';

// Helper function to clear all auth-related data
const clearAuthData = () => {
  // List of known auth-related keys
  const authKeys = [
    'token',
    'userRole',
    'userId',
    'username',
    'userSettings',
    'sb-foghuyrshbofoxkawskc-auth-token', // Supabase auth token
    'nextauth.message', // NextAuth related
  ];

  // Clear specific auth-related items
  authKeys.forEach(key => localStorage.removeItem(key));
};

export const apiClient = {
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      clearAuthData();
      throw new Error('No authentication token found');
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      clearAuthData();
      throw new Error('No user ID found');
    }

    try {
      // Use /auth/me endpoint instead of /users/{id}
      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          clearAuthData();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to fetch user data');
      }

      return response.json();
    } catch (error) {
      clearAuthData();
      throw error;
    }
  },

  async getAllUsers(): Promise<User[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/admin/users`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getAllAccounts(): Promise<Account[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/admin/accounts`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch accounts');
    const accounts = await response.json();
    
    // If the API doesn't join the user data, we need to fetch users separately
    const users = await this.getAllUsers();
    
    // Map accounts with their corresponding users
    return accounts.map((account: Account) => ({
      ...account,
      user: users.find(user => user.id === account.userId)
    }));
  },

  async deleteUser(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  async deleteAccount(id: number): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/admin/accounts/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete account');
  },

  async getAllTransactions(timeRange?: string): Promise<Transaction[]> {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${BASE_URL}/users/${userId}/transactions${timeRange ? `?timeRange=${timeRange}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async downloadStatement(timeRange?: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${BASE_URL}/users/${userId}/transactions/download${timeRange ? `?timeRange=${timeRange}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to download statement');
    return response.blob();
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      clearAuthData(); // Clear anyway even if no token
      return;
    }

    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear all auth-related data regardless of logout success/failure
      clearAuthData();
    }
  }
}; 