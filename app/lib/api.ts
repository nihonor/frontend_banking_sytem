export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
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

const BASE_URL = 'http://localhost:5000/api';

export const apiClient = {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getAllAccounts(): Promise<Account[]> {
    const response = await fetch(`${BASE_URL}/admin/accounts`, {
      credentials: 'include',
      headers: {
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
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  async deleteAccount(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/admin/accounts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete account');
  }
}; 