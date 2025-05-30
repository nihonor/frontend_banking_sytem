const API_BASE_URL = "http://localhost:8080/api"

// Types based on your backend entities
export interface User {
  id: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
  role: string
  status: string
  createdAt?: string
}

export interface Account {
  id: number
  accountNumber: string
  accountType: string
  balance: number
  userId: number
  createdAt?: string
  status?: string
}

export interface Transaction {
  id: number
  fromAccountNumber?: string
  toAccountNumber?: string
  amount: number
  transactionType: string
  description?: string
  timestamp: string
  status?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  id: number
  token: string
  username: string
  role: string
  message: string
}

export interface AuditLog {
  id: number;
  userId: number;
  entity: string;
  action: string;
  ipAddress: string;
  timestamp: string;
}

export interface CreateAccountRequest {
  userId: number;
  accountType: string;
  initialBalance?: number;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  colorScheme: 'blue' | 'green' | 'purple';
  animations: boolean;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    types: {
      transactions: boolean;
      security: boolean;
      promotions: boolean;
      news: boolean;
    };
  };
  accessibility: {
    textSize: 'small' | 'medium' | 'large';
  };
}

// API Client class
export class ApiClient {
  private baseURL: string
  private token: string | null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: "include",
    };

    // Log request details (but not sensitive data)
    console.log("API Request:", {
      url,
      method: options.method || 'GET',
      hasAuthHeader: !!(config.headers as any)?.Authorization,
      authHeaderPrefix: (config.headers as any)?.Authorization?.substring(0, 7) || 'none'
    });

    try {
      const response = await fetch(url, config);
      
      // For DELETE operations, return null for 204 responses
      if (response.status === 204) {
        return null as T;
      }

      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (e) {
        // If parsing fails and the response wasn't ok, throw an error
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("You don't have permission to perform this action. Please check your authentication and account status.");
          }
          throw new Error(`Request failed with status: ${response.status}`);
        }
        // If parsing fails but response was ok (like for 204), return null
        return null as T;
      }

      // If we got JSON but the response wasn't ok, throw with the error message
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(data.message || "You don't have permission to perform this action. Please check your authentication and account status.");
        }
        throw new Error(data.message || `Request failed with status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error("API request failed:", {
        url,
        method: options.method || 'GET',
        error: error.message || 'Unknown error',
        status: error.status
      });
      throw error;
    }
  }

  public setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    localStorage.removeItem("token")
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async register(user: Partial<User>): Promise<User> {
    return this.request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    })
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    })
    this.clearToken()
    return response
  }

  // User endpoints
  async getUserById(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async getUserAccounts(id: number): Promise<Account[]> {
    return this.request<Account[]>(`/users/${id}/accounts`)
  }

  async createAccount(userId: number, accountType: string): Promise<Account> {
    return this.request<Account>(`/users/${userId}/accounts?accountType=${accountType}`, {
      method: "POST",
    })
  }

  // Transaction endpoints
  async deposit(accountNumber: string, amount: number): Promise<Account> {
    return this.request<Account>(`/transactions/deposit/${accountNumber}?amount=${amount}`, {
      method: "PUT",
    })
  }

  async withdraw(accountNumber: string, amount: number): Promise<Account> {
    return this.request<Account>(`/transactions/withdraw/${accountNumber}?amount=${amount}`, {
      method: "PUT",
    })
  }

  async transfer(fromAccountNumber: string, toAccountNumber: string, amount: number): Promise<void> {
    return this.request<void>(
      `/transactions/transfer?fromAccountNumber=${fromAccountNumber}&toAccountNumber=${toAccountNumber}&amount=${amount}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      }
    );
  }

  async getUserTransactionHistory(userId: number): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/transactions/history/user/${userId}`)
  }

  async getRecentRecipients(userId: number): Promise<{ accountNumber: string; name: string; recentAmount: number }[]> {
    const transactions = await this.getUserTransactionHistory(userId);
    const currentUserAccounts = await this.getUserAccounts(userId);
    const userAccountNumbers = new Set(currentUserAccounts.map(acc => acc.accountNumber));
    
    // Get unique recipients from recent transactions
    const recipientsMap = new Map();
    
    transactions
      .filter(trans => trans.transactionType === 'TRANSFER')
      .forEach(trans => {
        // If this user is the sender, add recipient
        if (userAccountNumbers.has(trans.fromAccountNumber!)) {
          const recipientAccNum = trans.toAccountNumber!;
          if (!recipientsMap.has(recipientAccNum)) {
            recipientsMap.set(recipientAccNum, {
              accountNumber: recipientAccNum,
              name: `Account ${recipientAccNum.substring(recipientAccNum.length - 4)}`,
              recentAmount: trans.amount,
              lastTransactionTime: new Date(trans.timestamp)
            });
          }
        }
      });

    // Convert to array and sort by most recent
    return Array.from(recipientsMap.values())
      .sort((a, b) => b.lastTransactionTime.getTime() - a.lastTransactionTime.getTime())
      .slice(0, 5)
      .map(({ accountNumber, name, recentAmount }) => ({
        accountNumber,
        name,
        recentAmount
      }));
  }

  // Admin endpoints
  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>("/admin/users")
  }

  async getAllAccounts(): Promise<Account[]> {
    return this.request<Account[]>("/admin/accounts")
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>("/admin/transactions")
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/admin/users/${id}`, {
      method: "DELETE",
    })
  }

  async deleteAccount(id: number): Promise<void> {
    await this.request<void>(`/admin/accounts/${id}`, {
      method: "DELETE"
    });
  }

  // Audit Log endpoints
  async getAllAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>("/audit-logs");
  }

  async getUserAuditLogs(userId: number): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit-logs/user/${userId}`);
  }

  async getAuditLogsByEntity(entity: string): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit-logs/entity/${entity}`);
  }

  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    return this.request<AuditLog[]>(`/audit-logs/action/${action}`);
  }

  async getAuditLogsByDateRange(start: Date, end: Date): Promise<AuditLog[]> {
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    return this.request<AuditLog[]>(`/audit-logs/range?start=${startISO}&end=${endISO}`);
  }

  // Admin user management endpoints
  async suspendUser(userId: number): Promise<User> {
    const response = await this.request<User>(`/users/${userId}/suspend`, {
      method: 'PUT'
    });
    return response;
  }

  async activateUser(userId: number): Promise<User> {
    const response = await this.request<User>(`/users/${userId}/activate`, {
      method: 'PUT'
    });
    return response;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    console.log('Updating user with ID:', userId, 'Data:', userData);
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    console.log('Update response:', response);
    return response;
  }

  async createCustomer(userData: Partial<User>): Promise<User> {
    return this.request<User>("/users/create-customer", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Add these methods to the ApiClient class
  async updateAccount(id: number, accountData: Partial<Account>): Promise<Account> {
    return this.request<Account>(`/admin/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(accountData)
    });
  }

  async suspendAccount(id: number): Promise<Account> {
    return this.updateAccount(id, { status: "SUSPENDED" });
  }

  async activateAccount(id: number): Promise<Account> {
    return this.updateAccount(id, { status: "ACTIVE" });
  }

  async createAccountForUser(userId: number, accountType: string, initialBalance: number = 0): Promise<Account> {
    return this.request<Account>(
      `/users/${userId}/accounts?accountType=${accountType}`,
      {
        method: "POST"
      }
    );
  }

  // Add this new method
  async getCurrentUser(): Promise<User> {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      throw new Error("No user ID found");
    }
    return this.request<User>(`/users/${userId}`);
  }

  // Add these methods inside the ApiClient class
  async getUserSettings(userId: number): Promise<UserSettings> {
    return this.request<UserSettings>(`/users/${userId}/settings`);
  }

  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>(`/users/${userId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
