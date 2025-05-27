const API_BASE_URL = "http://localhost:8080/api"

// Types based on your backend entities
export interface User {
  id: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
  role: string
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
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: "include",
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
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
      },
    )
  }

  async getUserTransactionHistory(userId: number): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/transactions/history/user/${userId}`)
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
    return this.request<void>(`/admin/accounts/${id}`, {
      method: "DELETE",
    })
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
    const response = await this.request<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response;
  }

  async createCustomer(userData: Partial<User>): Promise<User> {
    return this.request<User>("/users/create-customer", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
